/**
 * Parse a standard poker-site hand history (PokerStars-style) into structured JSON.
 * Uses a line-by-line state machine over HEADER → PREFLOP → FLOP → TURN → RIVER → SUMMARY.
 *
 * @param {string} rawText
 * @returns {object}
 */
export function parseHandHistory(rawText) {
  const hand = {
    handId: null,
    blinds: { small: null, big: null },
    players: [],
    hero: null,
    heroCards: null,
    board: {
      flop: [],
      turn: null,
      river: null,
      all: [],
    },
    actions: [],
    street: null,
  }

  let currentState = 'HEADER'
  const lines = String(rawText ?? '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  for (const line of lines) {
    // Street markers can appear regardless of prior state.
    if (/^\*\*\*\s*HOLE CARDS\s*\*\*\*/i.test(line)) {
      currentState = 'PREFLOP'
      hand.street = 'preflop'
      continue
    }

    const flopMatch = line.match(/^\*\*\*\s*FLOP\s*\*\*\*\s*\[([^\]]+)\]/i)
    if (flopMatch) {
      currentState = 'FLOP'
      hand.street = 'flop'
      hand.board.flop = parseCards(flopMatch[1])
      hand.board.all = [...hand.board.flop]
      continue
    }

    const turnMatch = line.match(
      /^\*\*\*\s*TURN\s*\*\*\*\s*\[[^\]]+\]\s*\[([^\]]+)\]/i,
    )
    if (turnMatch) {
      currentState = 'TURN'
      hand.street = 'turn'
      hand.board.turn = parseCards(turnMatch[1])[0] ?? null
      hand.board.all = [
        ...hand.board.flop,
        ...(hand.board.turn ? [hand.board.turn] : []),
      ]
      continue
    }

    const riverMatch = line.match(
      /^\*\*\*\s*RIVER\s*\*\*\*\s*\[[^\]]+\]\s*\[([^\]]+)\]/i,
    )
    if (riverMatch) {
      currentState = 'RIVER'
      hand.street = 'river'
      hand.board.river = parseCards(riverMatch[1])[0] ?? null
      hand.board.all = [
        ...hand.board.flop,
        ...(hand.board.turn ? [hand.board.turn] : []),
        ...(hand.board.river ? [hand.board.river] : []),
      ]
      continue
    }

    if (/^\*\*\*\s*SUMMARY\s*\*\*\*/i.test(line)) {
      currentState = 'SUMMARY'
      hand.street = 'summary'
      continue
    }

    switch (currentState) {
      case 'HEADER':
        parseHeaderLine(line, hand)
        break
      case 'PREFLOP':
      case 'FLOP':
      case 'TURN':
      case 'RIVER':
        parseActionOrDealLine(line, hand, currentState.toLowerCase())
        break
      case 'SUMMARY':
        // Summary lines are ignored for now beyond street tracking.
        break
      default:
        break
    }
  }

  return hand
}

function parseCards(raw) {
  return String(raw)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
}

function parseHeaderLine(line, hand) {
  const handIdMatch = line.match(
    /Hand\s*#\s*(\d+)/i,
  ) || line.match(/#(\d{6,})/)

  if (handIdMatch && !hand.handId) {
    hand.handId = handIdMatch[1]
  }

  const blindsMatch =
    line.match(/\(\$?([\d.]+)\/\$?([\d.]+)(?:\s*[A-Z]+)?\)/) ||
    line.match(/blinds?\s*\$?([\d.]+)\/\$?([\d.]+)/i)

  if (blindsMatch && hand.blinds.small == null) {
    hand.blinds.small = Number(blindsMatch[1])
    hand.blinds.big = Number(blindsMatch[2])
  }

  const seatMatch = line.match(
    /^Seat\s+(\d+):\s+(.+?)\s+\(\$?([\d.]+)\s+in chips\)/i,
  )
  if (seatMatch) {
    hand.players.push({
      seat: Number(seatMatch[1]),
      name: seatMatch[2].trim(),
      stack: Number(seatMatch[3]),
    })
    return
  }

  // Blind posts are still part of the header / pre-deal phase.
  const postMatch = line.match(
    /^(.+?):\s+posts\s+(small blind|big blind|the ante)\s+\$?([\d.]+)/i,
  )
  if (postMatch) {
    hand.actions.push({
      street: 'blinds',
      player: postMatch[1].trim(),
      action: normalizePostAction(postMatch[2]),
      amount: Number(postMatch[3]),
      raw: line,
    })
  }
}

function parseActionOrDealLine(line, hand, street) {
  const dealtMatch = line.match(/^Dealt to\s+(.+?)\s+\[([^\]]+)\]/i)
  if (dealtMatch) {
    hand.hero = dealtMatch[1].trim()
    hand.heroCards = parseCards(dealtMatch[2])
    return
  }

  const uncalledMatch = line.match(
    /^Uncalled bet\s+\(\$?([\d.]+)\)\s+returned to\s+(.+)$/i,
  )
  if (uncalledMatch) {
    hand.actions.push({
      street,
      player: uncalledMatch[2].trim(),
      action: 'uncalled_bet_returned',
      amount: Number(uncalledMatch[1]),
      raw: line,
    })
    return
  }

  const collectedMatch = line.match(
    /^(.+?)\s+collected\s+\$?([\d.]+)\s+from\s+(?:the\s+)?pot/i,
  )
  if (collectedMatch) {
    hand.actions.push({
      street,
      player: collectedMatch[1].trim(),
      action: 'collected',
      amount: Number(collectedMatch[2]),
      raw: line,
    })
    return
  }

  // Player: folds
  // Player: checks
  // Player: calls $1.50
  // Player: bets $2
  // Player: raises $1.50 to $3
  // Player: raises $50 to $50 and is all-in
  const actionMatch = line.match(
    /^(.+?):\s+(folds|checks|calls|bets|raises)(?:\s+\$?([\d.]+))?(?:\s+to\s+\$?([\d.]+))?(?:\s+and is all-in)?$/i,
  )

  if (!actionMatch) return

  const player = actionMatch[1].trim()
  const action = actionMatch[2].toLowerCase()
  const firstAmount =
    actionMatch[3] != null ? Number(actionMatch[3]) : null
  const toAmount = actionMatch[4] != null ? Number(actionMatch[4]) : null
  const allIn = /and is all-in/i.test(line)

  const entry = {
    street,
    player,
    action,
    amount: null,
    raw: line,
  }

  if (action === 'raises') {
    entry.amount = toAmount ?? firstAmount
    entry.raiseBy = firstAmount
    entry.to = toAmount
  } else if (action === 'calls' || action === 'bets') {
    entry.amount = firstAmount
  }

  if (allIn) entry.allIn = true

  hand.actions.push(entry)
}

function normalizePostAction(kind) {
  const value = String(kind).toLowerCase()
  if (value.includes('small')) return 'post_sb'
  if (value.includes('big')) return 'post_bb'
  return 'post_ante'
}
