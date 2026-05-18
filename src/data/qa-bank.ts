import type { Citation, MockQa } from '@/types';

const cite = (source: string, page: string, section: string, note?: string): Citation => (
  note ? { source, page, section, note } : { source, page, section }
);

const q = (
  id: string,
  gameId: string | null,
  questionPatterns: string[],
  keywords: string[],
  answer: string,
  citations: Citation[],
  confidence: number,
  status: MockQa['status'] = 'grounded',
  suggestions?: string[]
): MockQa => ({
  id,
  gameId,
  questionPatterns,
  keywords,
  answer,
  citations,
  confidence,
  status,
  ...(suggestions ? { suggestions } : {})
});

export const MOCK_QA: MockQa[] = [
  q(
    'catan-distance-rule',
    'catan',
    ['Can I build a settlement next to another player?', 'How close can settlements be in Catan?'],
    ['settlement', 'next', 'distance'],
    'No. A new settlement must be at least two road intersections away from any other settlement or city, no matter who owns it.',
    [cite('Base Rulebook', '4', 'Building Rules', 'Distance rule')],
    0.97
  ),
  q(
    'catan-robber-steal',
    'catan',
    ['When do I steal with the robber?', 'How does robbing work after I move the robber?'],
    ['robber', 'steal', 'seven'],
    'After rolling a 7 or playing a Knight, move the robber to a new hex. If one or more opponents have a settlement or city on that hex, you choose one of those opponents and steal one random resource card from them.',
    [cite('Base Rulebook', '5', 'The Robber')],
    0.96
  ),
  q(
    'catan-longest-road',
    'catan',
    ['How is Longest Road awarded?', 'What happens if two players tie for Longest Road?'],
    ['longest', 'road', 'tie'],
    'The Longest Road card is awarded only for a continuous road of at least five segments. If another player ties the current holder, the current holder keeps the card; a challenger must exceed the existing length to take it.',
    [cite('Base Rulebook', '6', 'Special Cards')],
    0.95
  ),
  q(
    'ticket-to-ride-locomotive',
    'ticket-to-ride',
    ['Can I draw a face-up locomotive first?', 'How do locomotives work when drawing cards?'],
    ['locomotive', 'draw', 'face-up'],
    'Yes, but if you take a face-up locomotive as your first draw, it counts as your entire card-draw action for the turn.',
    [cite('USA Rulebook', '3', 'Draw Train Car Cards')],
    0.95
  ),
  q(
    'ticket-to-ride-double-route',
    'ticket-to-ride',
    ['Can both double routes be used in a two-player game?', 'How do parallel routes work with fewer players?'],
    ['double', 'parallel', 'route'],
    'In a two- or three-player game, only one track of a double route can be claimed. The parallel route is unavailable unless the rules for that map say otherwise.',
    [cite('USA Rulebook', '4', 'Double Routes')],
    0.94
  ),
  q(
    'ticket-to-ride-endgame',
    'ticket-to-ride',
    ['When does the game end in Ticket to Ride?', 'What happens when someone has two trains left?'],
    ['end', 'two', 'trains'],
    'As soon as a player ends their turn with two or fewer train cars left, each player, including that player, gets one final turn. After that, everyone scores completed and failed destination tickets.',
    [cite('USA Rulebook', '4', 'End of Game')],
    0.95
  ),
  q(
    'carcassonne-monastery',
    'carcassonne',
    ['When does a monastery score?', 'How do monasteries work in Carcassonne?'],
    ['monastery', 'score'],
    'A monastery scores as soon as it is surrounded on all eight adjacent spaces. It is worth 9 points total: the monastery tile itself plus each surrounding tile.',
    [cite('Base Rules', '2', 'Monasteries')],
    0.94
  ),
  q(
    'carcassonne-occupied-feature',
    'carcassonne',
    ['Can I place a meeple into a city someone already occupies?', 'May I join a road that already has another meeple?'],
    ['meeple', 'occupied', 'join'],
    'You may place a meeple only if the feature is currently unoccupied at the moment you place that tile. If your tile later connects to an occupied feature, both meeples stay and majority decides scoring.',
    [cite('Base Rules', '1', 'Placing Meeples')],
    0.95
  ),
  q(
    'carcassonne-farm-scoring',
    'carcassonne',
    ['How do farmers score at the end of the game?', 'What is a field worth in Carcassonne?'],
    ['farm', 'field', 'endgame'],
    'At the end of the game, each farmer scores 3 points for every completed city touching that field, regardless of city size. A single completed city scores only once per field.',
    [cite('Base Rules', '4', 'Farmers')],
    0.92
  ),
  q(
    'wingspan-brown-powers',
    'wingspan',
    ['Do all brown powers trigger?', 'How do brown powers activate in Wingspan?'],
    ['brown', 'power', 'activate'],
    'When you activate a habitat, you resolve the habitat action first and then each bird’s brown power from right to left in that habitat, if its trigger conditions are met.',
    [cite('Core Rulebook', '8', 'Activate a Habitat')],
    0.93
  ),
  q(
    'wingspan-egg-cost',
    'wingspan',
    ['When do I have to spend eggs to play a bird?', 'Why does the fourth bird cost eggs?'],
    ['eggs', 'cost', 'play'],
    'When you play a bird, you pay the egg cost shown above the column where the bird will be placed. The first slot in a habitat costs no eggs, while later slots cost one or more eggs.',
    [cite('Core Rulebook', '7', 'Play a Bird')],
    0.95
  ),
  q(
    'wingspan-birdfeeder-reroll',
    'wingspan',
    ['When can I reroll the birdfeeder?', 'May I reroll if all remaining dice match?'],
    ['birdfeeder', 'reroll', 'dice'],
    'Before taking food, you may reroll all dice in the birdfeeder if every die shows the same face, or if all dice remaining there show the same face after earlier picks.',
    [cite('Core Rulebook', '6', 'Gain Food')],
    0.94
  ),
  q(
    'gloomhaven-damage-negation',
    'gloomhaven',
    ['Can I lose a card to stop damage?', 'How do I negate damage in Gloomhaven?'],
    ['lose', 'card', 'damage'],
    'Yes. When damage would be dealt, you may lose one card from your hand or two from your discard pile to negate the entire source of damage.',
    [cite('Rulebook', '28', 'Suffering Damage')],
    0.96
  ),
  q(
    'gloomhaven-long-rest',
    'gloomhaven',
    ['What does a long rest do?', 'How does long resting work?'],
    ['long', 'rest', 'initiative'],
    'A long rest sets your initiative to 99, lets you heal 2, refresh all your spent items, and recover all discarded cards except one that you choose to lose from your discard pile.',
    [cite('Rulebook', '17', 'Resting')],
    0.95
  ),
  q(
    'gloomhaven-movement-blocking',
    'gloomhaven',
    ['Can I move through allies or enemies?', 'Do figures block movement in Gloomhaven?'],
    ['move', 'through', 'enemy'],
    'You can move through allies but not through enemies unless you have Jump or Flying. No figure may end its movement in an occupied hex.',
    [cite('Rulebook', '19', 'Movement')],
    0.95
  ),
  q(
    'terraforming-mars-actions',
    'terraforming-mars',
    ['Can I take two actions?', 'How many actions can I do on my turn in Terraforming Mars?'],
    ['action', 'turn'],
    'On your turn you usually take one or two actions. You can stop after one action, but you can never take more than two before play passes.',
    [cite('Rulebook', '9', 'Player Turns')],
    0.94
  ),
  q(
    'terraforming-mars-greenery',
    'terraforming-mars',
    ['What happens when I place a greenery tile?', 'Does greenery raise oxygen right away?'],
    ['greenery', 'oxygen', 'tile'],
    'Yes. Each time you place a greenery tile, you immediately raise oxygen one step and gain the matching Terraform Rating increase.',
    [cite('Rulebook', '10', 'Standard Projects and Tiles')],
    0.95
  ),
  q(
    'terraforming-mars-city-adjacency',
    'terraforming-mars',
    ['Can I place a city next to another city?', 'How close can cities be on Mars?'],
    ['city', 'adjacent', 'placement'],
    'No. A city tile cannot be placed adjacent to another city tile unless a card effect specifically overrides that restriction.',
    [cite('Rulebook', '11', 'City Tiles')],
    0.94
  ),
  q(
    'azul-factory-choice',
    'azul',
    ['Can I split colors from one factory?', 'Do I have to take all of one color in Azul?'],
    ['split', 'factory', 'color'],
    'You must take all tiles of exactly one color from the chosen factory. Any remaining tiles from that factory slide into the center of the table.',
    [cite('Rulebook', '3', 'Offer Phase')],
    0.95
  ),
  q(
    'azul-overflow',
    'azul',
    ['What happens to extra tiles in a completed row?', 'Where do leftover tiles go after wall tiling?'],
    ['overflow', 'row', 'box'],
    'When a pattern line is completed, exactly one tile moves to your wall. Any other tiles from that completed line are returned to the box lid, not kept for later.',
    [cite('Rulebook', '4', 'Wall-Tiling')],
    0.94
  ),
  q(
    'azul-round-end',
    'azul',
    ['When does the round end in Azul?', 'Do we score as soon as the factories are empty?'],
    ['round', 'end', 'factories'],
    'The round ends only after all factories and the center have been emptied. Then every player performs wall-tiling and applies floor-line penalties before the next round is prepared.',
    [cite('Rulebook', '4', 'End of Round')],
    0.94
  ),
  q(
    'pandemic-epidemic',
    'pandemic',
    ['What does an epidemic do?', 'When do epidemics intensify?'],
    ['epidemic', 'intensify'],
    'An epidemic increases the infection rate, infects the bottom city of the infection deck with three cubes, then shuffles the infection discard pile back on top of the deck.',
    [cite('Rulebook', '6', 'Resolving Epidemics')],
    0.95
  ),
  q(
    'pandemic-treat-disease',
    'pandemic',
    ['How many cubes do I remove when I treat disease?', 'Does a cured disease treat all cubes at once?'],
    ['treat', 'cured', 'cubes'],
    'Treat Disease removes one cube of the chosen color in your city. If that disease has been cured, a single Treat Disease action removes all cubes of that color from the city.',
    [cite('Rulebook', '4', 'Actions')],
    0.95
  ),
  q(
    'pandemic-scientist-cure',
    'pandemic',
    ['How many cards does the Scientist need to cure a disease?', 'Does the Scientist still need five cards?'],
    ['scientist', 'cure', 'four'],
    'The Scientist needs only four cards of the same color at a research station to discover a cure instead of the usual five.',
    [cite('Role Card', '—', 'Scientist Ability')],
    0.97
  ),
  q(
    'root-battle-casualties',
    'root',
    ['Who gets removed first in battle?', 'Do warriors have to be removed before buildings in Root?'],
    ['battle', 'warriors', 'buildings'],
    'When a faction takes hits in battle, it must remove warriors in the clearing before removing buildings or tokens. Both sides deal hits in the same battle, but casualty choice still follows that priority.',
    [cite('Law of Root', '4', 'Battle')],
    0.84,
    'low-confidence',
    ['If a faction ability changes removal order, mention the faction and card involved.']
  ),
  q(
    'root-outrage',
    'root',
    ['When does Woodland Alliance outrage trigger?', 'Do I owe a card for moving into sympathy?'],
    ['outrage', 'sympathy', 'move'],
    'Outrage triggers when another player moves warriors into a sympathetic clearing or removes a sympathy token. That player must give the Woodland Alliance a card matching the clearing suit, or a bird card, if possible.',
    [cite('Law of Root', '8', 'Woodland Alliance')],
    0.87,
    'low-confidence',
    ['Call out the exact suit and whether sympathy was moved into or removed.']
  ),
  q(
    'root-vagabond-hostile',
    'root',
    ['Does moving into a hostile clearing cost extra boots for the Vagabond?', 'How does hostility affect Vagabond movement?'],
    ['vagabond', 'hostile', 'boot'],
    'Yes. The Vagabond must spend one extra boot to move into a clearing that contains any piece of a hostile faction.',
    [cite('Law of Root', '11', 'Vagabond Relationships')],
    0.89,
    'low-confidence',
    ['If a card or slip ability is involved, mention it so I can narrow the exception.']
  ),
  q(
    'scythe-stars',
    'scythe',
    ['When does the game end in Scythe?', 'How many stars end the game?'],
    ['star', 'end'],
    'The game ends immediately when a player places their sixth star. Then everyone totals coins, stars, territories, and resource bonuses to determine the winner.',
    [cite('Learn to Play', '22', 'Game End')],
    0.94
  ),
  q(
    'scythe-workers-combat',
    'scythe',
    ['Do workers fight in combat?', 'Can workers add power or combat cards?'],
    ['workers', 'combat', 'power'],
    'No. Workers never participate in combat, cannot add power or combat cards, and are simply present on the territory if the battle happens there.',
    [cite('Learn to Play', '14', 'Combat')],
    0.95
  ),
  q(
    'scythe-river-crossing',
    'scythe',
    ['Can my character cross a river on turn one?', 'When do units ignore rivers in Scythe?'],
    ['river', 'cross', 'mech'],
    'Normally your character and workers cannot cross rivers until you unlock the appropriate mech ability or faction ability that allows it. Rivers are a hard movement barrier until then.',
    [cite('Learn to Play', '9', 'Movement Restrictions')],
    0.93
  ),
  q(
    'seven-wonders-resource-buy',
    'seven-wonders',
    ['How do I buy resources from neighbors?', 'Can I buy both left and right resources?'],
    ['buy', 'resources', 'neighbors'],
    'Yes. When you play a card, you may buy available resources from either or both adjacent neighbors. You pay coins to the neighbors, but the resources are only borrowed for that single card play.',
    [cite('Rulebook', '6', 'Commercial Transactions')],
    0.95
  ),
  q(
    'seven-wonders-chain-building',
    'seven-wonders',
    ['Does a chain symbol make the card free?', 'How do chain icons work in 7 Wonders?'],
    ['chain', 'free', 'symbol'],
    'Yes. If you already built the card showing the matching chain symbol, you may build the chained card for free instead of paying its resource cost.',
    [cite('Rulebook', '5', 'Constructing Buildings')],
    0.95
  ),
  q(
    'seven-wonders-science',
    'seven-wonders',
    ['How are science symbols scored?', 'Do science sets and duplicates both matter?'],
    ['science', 'symbols', 'score'],
    'At the end of the game, each science symbol type scores the square of how many of that symbol you have, and each complete set of one tablet, one compass, and one gear scores an additional 7 points.',
    [cite('Rulebook', '8', 'Science')],
    0.94
  ),
  q(
    'splendor-double-gem',
    'splendor',
    ['Can I take two of the same gem?', 'How do gem taking rules work in Splendor?'],
    ['two', 'same', 'gem'],
    'You can take two gems of the same color only if there are at least four tokens of that color in the supply before you take them.',
    [cite('Rulebook', '2', 'Take Tokens')],
    0.95
  ),
  q(
    'splendor-reserve-gold',
    'splendor',
    ['Do I get a gold token when I reserve a card?', 'How does reserving work in Splendor?'],
    ['reserve', 'gold', 'card'],
    'When you reserve a development card, you keep it in hand and take one gold joker token if any remain. Each player may have at most three reserved cards.',
    [cite('Rulebook', '2', 'Reserve a Card')],
    0.95
  ),
  q(
    'splendor-noble-visit',
    'splendor',
    ['When does a noble visit?', 'Can two nobles visit me in one turn?'],
    ['noble', 'visit', 'turn'],
    'At the end of your turn, if your purchased cards meet a noble’s requirement, that noble visits automatically. If you qualify for more than one noble, you choose only one to visit.',
    [cite('Rulebook', '3', 'Nobles')],
    0.94
  ),
  q(
    'brass-overbuild',
    'brass-birmingham',
    ['Can I overbuild my own tile?', 'When may I replace an industry in Brass Birmingham?'],
    ['overbuild', 'industry', 'replace'],
    'Yes, you can overbuild one of your own industries if the new tile is the next higher level and the old one is either obsolete or the rules specifically allow overbuilding that type.',
    [cite('Rulebook', '7', 'Build Action')],
    0.86,
    'low-confidence',
    ['Name the exact industry tile and whether it has flipped if you want the precise exception.']
  ),
  q(
    'brass-sell-beer',
    'brass-birmingham',
    ['When do I need beer to sell?', 'Where can the beer come from in Brass Birmingham?'],
    ['beer', 'sell', 'merchant'],
    'Selling usually requires consuming one beer for each sale, taken from your own connected brewery, an opponent’s connected brewery, or a merchant tile that provides beer if the route is connected.',
    [cite('Rulebook', '9', 'Sell Action')],
    0.84,
    'low-confidence',
    ['If the sale is to Birmingham or uses pottery, mention it because those details can change the exception.']
  ),
  q(
    'brass-rail-cost',
    'brass-birmingham',
    ['How do I pay for rail links?', 'Does building a rail always cost coal and money?'],
    ['rail', 'coal', 'cost'],
    'Each rail link costs £5 and one coal. The coal must come from a connected source or the market, and the money is paid from your cash supply.',
    [cite('Rulebook', '8', 'Rail Era and Link Building')],
    0.88,
    'low-confidence',
    ['If you are asking about double links or market access, say which cities are connected.']
  ),
  q(
    'spirit-island-defend',
    'spirit-island',
    ['How does defend stop blight?', 'What does defend do in Spirit Island?'],
    ['defend', 'blight'],
    'Defend reduces incoming damage to the land and Dahan in that land for the current action only. If enough damage remains after defend, blight is still added normally.',
    [cite('Rulebook', '9', 'Damage and Defend')],
    0.93
  ),
  q(
    'spirit-island-slow-powers',
    'spirit-island',
    ['When do slow powers happen?', 'Do slow powers resolve before the invaders act?'],
    ['slow', 'powers', 'timing'],
    'Slow powers resolve only after the Invader Phase and Time Passes. Fast powers happen before the invaders act; slow powers do not.',
    [cite('Rulebook', '8', 'Turn Structure')],
    0.94
  ),
  q(
    'spirit-island-range',
    'spirit-island',
    ['Where do I measure power range from?', 'Can I target a land with no presence?'],
    ['range', 'presence', 'target'],
    'Unless a power says otherwise, range is measured from one of your presence. If a power requires range 0, the target land must contain your presence unless another rule changes the origin.',
    [cite('Rulebook', '17', 'Range and Targeting')],
    0.93
  ),
  q(
    'cascadia-nature-token',
    'cascadia',
    ['When can I use a nature token?', 'How do nature tokens work in Cascadia?'],
    ['nature', 'token'],
    'A nature token can be spent to draft any wildlife token with any habitat tile, ignoring the normal paired market restriction. You may also spend one to wipe and refill the market when the rules allow.',
    [cite('Rulebook', '4', 'Nature Tokens')],
    0.9
  ),
  q(
    'cascadia-habitat-corridors',
    'cascadia',
    ['How are habitat corridors scored?', 'Do I score every forest group in Cascadia?'],
    ['habitat', 'corridor', 'largest'],
    'Each habitat type scores only for your single largest contiguous corridor of that habitat. Smaller disconnected groups of the same habitat do not add extra corridor points.',
    [cite('Rulebook', '5', 'Habitat Scoring')],
    0.94
  ),
  q(
    'cascadia-wildlife-placement',
    'cascadia',
    ['Can I put any animal on any tile?', 'How many wildlife tokens can a habitat tile hold?'],
    ['wildlife', 'tile', 'animal'],
    'A habitat tile can hold at most one wildlife token, and the token must be one of the animal types printed on that tile. If the tile does not show that animal, the placement is illegal.',
    [cite('Rulebook', '3', 'Place Wildlife')],
    0.95
  ),
  q(
    'ark-nova-break',
    'ark-nova',
    ['What happens during a break?', 'What does break refresh in Ark Nova?'],
    ['break', 'refresh'],
    'During a break, players resolve income, refresh the association board, discard and refill the card row, reset break markers, and refresh cards or tokens that say they refresh during a break.',
    [cite('Rulebook', '11', 'Break')],
    0.88,
    'low-confidence',
    ['If your question is about X-tokens, universities, or a specific sponsor, mention that detail.']
  ),
  q(
    'ark-nova-animal-requirements',
    'ark-nova',
    ['What do I need before I can play an animal?', 'Can I play an animal without an enclosure?'],
    ['animal', 'enclosure', 'requirements'],
    'To play an animal, you need an enclosure of the correct size, the required icons or reputation if the card asks for them, and enough money to pay its cost. Most animals cannot be played without a legal enclosure.',
    [cite('Rulebook', '9', 'Animals')],
    0.9,
    'low-confidence',
    ['Name the animal card if it has a special rule such as petting zoo, aviary, or reptile house.']
  ),
  q(
    'ark-nova-display-refill',
    'ark-nova',
    ['When is the card display refilled?', 'Does the row refill right after I take a card?'],
    ['display', 'refill', 'row'],
    'The display refills immediately after a card leaves the row unless a break is in progress or a specific effect changes that timing. You normally maintain a full card row during play.',
    [cite('Rulebook', '8', 'Cards Action')],
    0.86,
    'low-confidence',
    ['If the card came from the reputation range or a sponsor effect, mention that source for a tighter ruling.']
  ),
  q(
    'everdell-basic-event',
    'everdell',
    ['Can I claim a basic event immediately?', 'How do events work in Everdell?'],
    ['basic', 'event'],
    'You may claim a basic event only when your city already meets the exact symbol requirements shown on that event tile. Claiming it uses one worker placed on the event.',
    [cite('Rulebook', '11', 'Events')],
    0.92
  ),
  q(
    'everdell-red-destination',
    'everdell',
    ['Can another player use my red destination card?', 'How do destination cards work in Everdell?'],
    ['destination', 'red', 'card'],
    'If a red destination card has an open worker space, another player may use it unless the card text says otherwise. Once a worker is placed there, the space is occupied for the season.',
    [cite('Rulebook', '9', 'Destination Cards')],
    0.9
  ),
  q(
    'everdell-free-critter',
    'everdell',
    ['When is a critter free to play?', 'Do paired constructions make critters cost nothing?'],
    ['free', 'critter', 'construction'],
    'If you already have the listed construction in your city, you may play the paired critter for free by using the critter’s “occupy” link instead of paying its printed cost.',
    [cite('Rulebook', '8', 'Construction and Critter Pairs')],
    0.94
  ),
  q(
    'dune-imperium-board-space',
    'dune-imperium',
    ['Can I go to the same space twice?', 'Can multiple agents use the same board space in Dune Imperium?'],
    ['space', 'twice', 'agent'],
    'Normally no. Once a board space is occupied by any agent, it is blocked for the rest of the round unless the space or a card explicitly says otherwise.',
    [cite('Rulebook', '7', 'Agent Turns')],
    0.94
  ),
  q(
    'dune-imperium-reveal-turn',
    'dune-imperium',
    ['What do I do on my reveal turn?', 'When can I reveal cards in Dune Imperium?'],
    ['reveal', 'turn', 'persuasion'],
    'After you have placed all your agents or choose not to place more, you take a reveal turn. Reveal your remaining hand, total persuasion and sword icons, buy cards, and add combat strength from those revealed cards.',
    [cite('Rulebook', '8', 'Reveal Turn')],
    0.94
  ),
  q(
    'dune-imperium-alliance',
    'dune-imperium',
    ['How do alliance tokens work?', 'When do I take the faction alliance point?'],
    ['alliance', 'influence', 'point'],
    'If you have at least 4 influence with a faction and strictly more than every other player, you take that faction’s alliance token and score its victory point. You lose it if someone later surpasses you.',
    [cite('Rulebook', '10', 'Factions and Alliances')],
    0.93
  ),
  q(
    'dominion-shuffle',
    'dominion',
    ['What if I need to draw from an empty deck?', 'How do I shuffle my discard into my deck in Dominion?'],
    ['empty', 'deck', 'draw'],
    'Whenever you need to draw and your deck runs out, shuffle your discard pile to form a new deck, then continue drawing the remaining cards.',
    [cite('Base Rules', '5', 'Drawing Cards')],
    0.96
  ),
  q(
    'dominion-buys',
    'dominion',
    ['Can I buy more than one card on my turn?', 'What does +Buy let me do?'],
    ['buy', 'multiple', 'plusbuy'],
    'By default you get one Buy per turn. If a card gives you +Buy, you may spend coins to buy additional cards in the Buy phase, including the same card more than once if copies remain.',
    [cite('Base Rules', '4', 'Buy Phase')],
    0.95
  ),
  q(
    'dominion-duration',
    'dominion',
    ['Do Duration cards stay in play?', 'When does a Duration card leave the table?'],
    ['duration', 'stay', 'next'],
    'Yes. A Duration card stays in play until the turn when its next-turn effect has finished resolving. Only then is it discarded during cleanup.',
    [cite('Seaside Rules', '2', 'Duration Cards')],
    0.93
  ),
  q(
    'arnak-guardians',
    'lost-ruins-of-arnak',
    ['Do I have to defeat a guardian immediately?', 'How do guardians work in Arnak?'],
    ['guardian', 'defeat'],
    'No. Uncovering a site places a guardian there right away, but defeating that guardian is optional and usually happens later when you can pay its cost and take the reward.',
    [cite('Rulebook', '8', 'Discovering New Sites')],
    0.93
  ),
  q(
    'arnak-site-occupancy',
    'lost-ruins-of-arnak',
    ['Can two archaeologists use the same site in one round?', 'Are sites blocked after someone goes there?'],
    ['site', 'occupied', 'round'],
    'Once a worker space or site is occupied by an archaeologist, it stays blocked for the rest of that round unless a card or effect explicitly says otherwise.',
    [cite('Rulebook', '6', 'Worker Placement')],
    0.94
  ),
  q(
    'arnak-fear-cards',
    'lost-ruins-of-arnak',
    ['How do fear cards affect scoring?', 'Are fear cards bad at the end of Arnak?'],
    ['fear', 'cards', 'score'],
    'Each Fear card in your deck is worth −1 point at the end of the game unless an effect removes it. They also clutter your draws because they usually do not help your actions.',
    [cite('Rulebook', '11', 'Endgame Scoring')],
    0.93
  ),
  q(
    'agricola-family-growth',
    'agricola',
    ['When can I grow my family?', 'Do I need an empty room to have another family member?'],
    ['family', 'growth', 'room'],
    'Normally you may grow your family only by taking the Family Growth action and only if you have an empty room in your home for the new family member.',
    [cite('Rulebook', '7', 'Family Growth')],
    0.95
  ),
  q(
    'agricola-breeding',
    'agricola',
    ['How does breeding work at harvest?', 'Do I get baby animals with only one parent?'],
    ['breeding', 'harvest', 'animals'],
    'During the Breeding step of harvest, each animal type breeds only if you have at least two of that type. You gain one offspring of each eligible type if you have legal room to keep it.',
    [cite('Rulebook', '9', 'Harvest')],
    0.95
  ),
  q(
    'agricola-begging',
    'agricola',
    ['What happens if I cannot feed my family?', 'How bad are begging cards in Agricola?'],
    ['feed', 'begging', 'cards'],
    'If you still cannot feed a family member after using food and allowed conversions, you take one Begging card per missing food. Each Begging card is worth −3 points at the end of the game.',
    [cite('Rulebook', '9', 'Feeding Your Family')],
    0.96
  ),
  q(
    'patchwork-turn-order',
    'patchwork',
    ['Who takes the next turn in Patchwork?', 'Can I take two turns in a row?'],
    ['turn', 'order', 'time'],
    'The player whose time token is furthest behind on the time track always takes the next turn. Yes, that means you can sometimes take multiple turns in a row.',
    [cite('Rulebook', '2', 'Time Track')],
    0.97
  ),
  q(
    'patchwork-button-income',
    'patchwork',
    ['When do I get button income?', 'Do I collect buttons by landing on income spaces or passing them?'],
    ['button', 'income', 'pass'],
    'You collect button income whenever your time token lands on or passes an income marker. The amount is based on the button icons currently visible on your quilt.',
    [cite('Rulebook', '3', 'Income')],
    0.96
  ),
  q(
    'patchwork-seven-by-seven',
    'patchwork',
    ['How is the 7×7 bonus awarded?', 'Who gets the 7 by 7 tile in Patchwork?'],
    ['7x7', 'bonus', 'tile'],
    'The first player to completely fill a 7×7 area anywhere on their quilt immediately takes the special patch. It is worth 7 bonus points and can be claimed only once.',
    [cite('Rulebook', '4', 'Special Tile')],
    0.95
  ),
  q(
    'jaipur-camels-hand-limit',
    'jaipur',
    ['Do camels count toward the hand limit?', 'Can I have seven cards plus camels?'],
    ['camels', 'hand', 'limit'],
    'Camels do not count against the hand limit because they stay in your herd area, not in your hand. Your hand limit of seven applies only to good cards.',
    [cite('Rulebook', '2', 'Game Play')],
    0.96
  ),
  q(
    'jaipur-sell-one-type',
    'jaipur',
    ['Can I sell two kinds of goods at once?', 'Do bonus tokens work if I mix goods together?'],
    ['sell', 'goods', 'bonus'],
    'No. A sell action may include only one type of good. Bonus tokens are awarded only when you sell at least three cards of that single good type in one action.',
    [cite('Rulebook', '3', 'Sell Goods')],
    0.96
  ),
  q(
    'jaipur-take-camels',
    'jaipur',
    ['What happens when I take camels from the market?', 'Can I take only some of the camels?'],
    ['take', 'camels', 'market'],
    'When you take camels, you must take all camels currently in the market. After that, refill the market back to five cards from the deck if possible.',
    [cite('Rulebook', '2', 'Take Camels')],
    0.95
  ),
  q(
    'viticulture-grande-worker',
    'viticulture-essential-edition',
    ['Can the grande worker use an occupied space?', 'What is special about the grande worker?'],
    ['grande', 'worker', 'occupied'],
    'Yes. Once per year, your grande worker may be placed on an action space even if another worker already occupies it, as long as the space normally allows workers.',
    [cite('Rulebook', '7', 'Grande Worker')],
    0.95
  ),
  q(
    'viticulture-workers-return',
    'viticulture-essential-edition',
    ['When do my workers come back?', 'Do workers return at the end of every season?'],
    ['workers', 'return', 'year'],
    'Workers stay where they are until you choose to pass into the next year. They do not return automatically between summer and winter.',
    [cite('Rulebook', '6', 'Changing Seasons')],
    0.95
  ),
  q(
    'viticulture-wine-orders',
    'viticulture-essential-edition',
    ['How do wine orders score?', 'Do I spend the wine when filling an order?'],
    ['wine', 'order', 'residual'],
    'To fill a wine order, you spend the exact wine tokens shown on the card. You then gain the card’s victory points, residual income increase, and sometimes an immediate bonus.',
    [cite('Rulebook', '10', 'Fill an Order')],
    0.95
  ),
  q(
    'power-grid-city-occupancy',
    'power-grid',
    ['How many houses fit in one city?', 'Can two players build in the same city in Power Grid?'],
    ['city', 'occupancy', 'step'],
    'City occupancy depends on the current game step. Step 1 allows one house per city, Step 2 allows two, and Step 3 allows three.',
    [cite('Rulebook', '5', 'Game Steps')],
    0.96
  ),
  q(
    'power-grid-resource-storage',
    'power-grid',
    ['How much fuel can a plant store?', 'Can I stockpile extra coal or oil on a power plant?'],
    ['fuel', 'store', 'double'],
    'A power plant may store up to twice the amount of each resource type it needs to run. For example, a plant needing two coal can store up to four coal.',
    [cite('Rulebook', '7', 'Buying Resources')],
    0.95
  ),
  q(
    'power-grid-bureaucracy',
    'power-grid',
    ['How do I get paid in bureaucracy?', 'Do I earn money for connected cities or powered cities?'],
    ['bureaucracy', 'paid', 'powered'],
    'You choose how many of your connected cities to power and are paid only for the number you actually power that round, not for every city in your network.',
    [cite('Rulebook', '8', 'Bureaucracy')],
    0.95
  ),
  q(
    'castles-of-burgundy-workers',
    'castles-of-burgundy',
    ['Can workers change a die value?', 'How do worker tokens help in Castles of Burgundy?'],
    ['workers', 'die', 'value'],
    'Yes. Each worker token lets you adjust one die result by 1 up or down, and you may spend multiple workers on the same die if needed.',
    [cite('Rulebook', '5', 'Worker Tiles')],
    0.95
  ),
  q(
    'castles-of-burgundy-placement-number',
    'castles-of-burgundy',
    ['Does tile placement ignore the printed hex number?', 'Can I place a tile in the right color region with the wrong die value?'],
    ['placement', 'hex', 'number'],
    'No. To place a tile, the destination space must match both the tile’s terrain region and the die value you are using unless another effect explicitly overrides that value.',
    [cite('Rulebook', '4', 'Place a Tile')],
    0.94
  ),
  q(
    'castles-of-burgundy-animals',
    'castles-of-burgundy',
    ['How do animal tiles score?', 'Do I score only the new animal tile or all matching animals?'],
    ['animal', 'score', 'region'],
    'When you place an animal tile, score points equal to the total number of animals of that type now in that pasture region, including the new tile and any matching animals already there.',
    [cite('Rulebook', '6', 'Animal Tiles')],
    0.93
  ),
  q(
    'crew-communication-token',
    'the-crew-quest-for-planet-nine',
    ['How does the communication token work?', 'Can I show any card when I communicate in The Crew?'],
    ['communication', 'token', 'show'],
    'Once per mission, each player may communicate exactly one card from hand by showing it with the token placed above, below, or in the middle to mean highest, lowest, or only card of that suit in hand.',
    [cite('Mission Manual', '4', 'Communication')],
    0.95
  ),
  q(
    'crew-table-talk',
    'the-crew-quest-for-planet-nine',
    ['Can we talk about our cards in The Crew?', 'Are we allowed to discuss exact card values?'],
    ['talk', 'cards', 'exact'],
    'No. Outside the allowed communication token, players may not reveal or describe the exact identity of cards in hand. General encouragement is fine, but hidden information must stay hidden.',
    [cite('Mission Manual', '3', 'Communication Limits')],
    0.95
  ),
  q(
    'crew-task-owner',
    'the-crew-quest-for-planet-nine',
    ['Who has to win a claimed task?', 'If I took the task card, can someone else win that card?'],
    ['task', 'owner', 'win'],
    'The player who claimed the task card must win the specified card in a trick unless the mission explicitly states another condition. If someone else wins it, the mission fails.',
    [cite('Mission Manual', '2', 'Tasks')],
    0.96
  ),
  q(
    'race-for-the-galaxy-selected-phases',
    'race-for-the-galaxy',
    ['Does everyone get to do the selected phases?', 'What happens if another player picks the same phase as me?'],
    ['phase', 'everyone', 'selected'],
    'Yes. Every selected phase happens for all players, even if they did not choose it. If multiple players choose the same phase, it still resolves once, and each chooser gets that phase’s bonus.',
    [cite('Rulebook', '3', 'Round Overview')],
    0.95
  ),
  q(
    'race-for-the-galaxy-military-worlds',
    'race-for-the-galaxy',
    ['How do military worlds get played?', 'Do I still discard cards for a military world?'],
    ['military', 'world', 'discard'],
    'Military worlds are settled without paying cards from hand, but only if your military strength is at least equal to the world’s military cost.',
    [cite('Rulebook', '5', 'Military Worlds')],
    0.95
  ),
  q(
    'race-for-the-galaxy-normal-cost',
    'race-for-the-galaxy',
    ['How do I pay for a normal world or development?', 'Are cards in hand the currency in Race for the Galaxy?'],
    ['pay', 'cards', 'currency'],
    'Yes. For non-military worlds and developments, you pay the cost by discarding that many cards from your hand unless a power reduces the cost.',
    [cite('Rulebook', '4', 'Play Cards')],
    0.95
  ),
  q(
    'bohnanza-hand-order',
    'bohnanza',
    ['Can I rearrange my hand?', 'May I sort my bean cards in Bohnanza?'],
    ['hand', 'order', 'rearrange'],
    'No. You must keep the cards in your hand in the order you received them. This hand-order rule is one of the game’s core restrictions.',
    [cite('Rulebook', '1', 'Important Rule')],
    0.97
  ),
  q(
    'bohnanza-first-card',
    'bohnanza',
    ['Do I have to plant the first card in my hand?', 'Can I skip planting my front bean card?'],
    ['plant', 'first', 'card'],
    'Yes. On your turn, you must plant the first bean card in your hand. You may also choose to plant the second card in hand immediately after that.',
    [cite('Rulebook', '2', 'Planting Beans')],
    0.97
  ),
  q(
    'bohnanza-field-limit',
    'bohnanza',
    ['How many bean types can one field hold?', 'Can I mix different beans in the same field?'],
    ['field', 'mix', 'bean'],
    'A field may contain only one type of bean. To plant a different type there, you must first harvest the existing field or use another empty field, including a purchased third field if available.',
    [cite('Rulebook', '2', 'Fields')],
    0.96
  ),
  q(
    'quacks-bust',
    'the-quacks-of-quedlinburg',
    ['When does my pot explode?', 'What total of white chips makes me bust?'],
    ['bust', 'white', 'chips'],
    'Your pot explodes as soon as the total value of white chips in it exceeds 7. At 7 exactly you are still safe; above 7 you bust immediately.',
    [cite('Rulebook', '5', 'Exploding Pot')],
    0.97
  ),
  q(
    'quacks-bust-reward',
    'the-quacks-of-quedlinburg',
    ['Can I score and buy after exploding?', 'What do I lose if my pot busts?'],
    ['explode', 'score', 'buy'],
    'If your pot explodes, you must choose either to take victory points or to buy ingredients that round; you do not get both rewards.',
    [cite('Rulebook', '6', 'After the Explosion')],
    0.95
  ),
  q(
    'quacks-rat-tails',
    'the-quacks-of-quedlinburg',
    ['How do rat tails help?', 'When do I move my droplet from rat tails?'],
    ['rat', 'tails', 'droplet'],
    'At the start of a round, count the rat tails between your score marker and the leader’s marker. Move your droplet forward that many spaces before brewing to get a catch-up boost.',
    [cite('Rulebook', '4', 'Rat Tails')],
    0.94
  ),
  q(
    'kingdomino-placement',
    'kingdomino',
    ['How must a domino connect?', 'Can I place a domino diagonally in Kingdomino?'],
    ['connect', 'domino', 'diagonal'],
    'Each new domino must connect to your castle or to at least one matching terrain edge. Diagonal contact does not count, and your kingdom may never exceed a 5×5 grid.',
    [cite('Rulebook', '2', 'Placing Dominos')],
    0.96
  ),
  q(
    'kingdomino-scoring',
    'kingdomino',
    ['How are crowns scored?', 'Do crowns multiply the size of a terrain area?'],
    ['crowns', 'score', 'area'],
    'Each connected terrain area scores its number of squares multiplied by the number of crowns in that area. If an area has no crowns, it scores zero.',
    [cite('Rulebook', '3', 'Scoring')],
    0.97
  ),
  q(
    'kingdomino-cannot-place',
    'kingdomino',
    ['What if my chosen domino cannot be placed?', 'Do I keep a domino if it will not fit in my kingdom?'],
    ['cannot', 'place', 'discard'],
    'If your selected domino cannot be legally placed, you must discard it and place nothing that turn. You still choose normally from the next row for the following round.',
    [cite('Rulebook', '2', 'Illegal Placement')],
    0.94
  ),
  q(
    'codenames-extra-guess',
    'codenames',
    ['How many guesses does my team get?', 'What does “plus one” mean in Codenames?'],
    ['guesses', 'plus', 'one'],
    'Your team may make up to the number of guesses given in the clue, plus one extra guess if you want. The turn also ends immediately on a wrong guess or a pass.',
    [cite('Rulebook', '3', 'Giving Clues and Guessing')],
    0.96
  ),
  q(
    'codenames-assassin',
    'codenames',
    ['What happens if we pick the assassin?', 'Does the assassin end the game right away?'],
    ['assassin', 'lose', 'immediately'],
    'Yes. If your team guesses the assassin, your team loses instantly and the game ends on the spot.',
    [cite('Rulebook', '4', 'Assassin')],
    0.98
  ),
  q(
    'codenames-zero-clue',
    'codenames',
    ['What does a clue number of zero mean?', 'Can we guess any number of words after a zero clue?'],
    ['zero', 'clue', 'unlimited'],
    'A clue of zero means none of your team’s words should relate to that clue. The team may keep guessing until they choose to stop or make a wrong guess, just as with any other turn.',
    [cite('Rulebook', '5', 'Special Numbers')],
    0.91
  ),
  q(
    'hanabi-clue-all-matching',
    'hanabi',
    ['Do I have to point out every matching card when I give a clue?', 'Can I clue only one red card if there are two?'],
    ['clue', 'all', 'matching'],
    'Yes. A legal clue must indicate every card of the named color or number in that player’s hand. You cannot intentionally omit a matching card.',
    [cite('Rulebook', '3', 'Giving Information')],
    0.97
  ),
  q(
    'hanabi-exact-card',
    'hanabi',
    ['Can I tell someone exactly what card they have?', 'May I say “your third card is the red 2” in Hanabi?'],
    ['exact', 'card', 'position'],
    'No. Information may be given only as a legal clue about one color or one number. Exact card identity and unofficial hints are not allowed.',
    [cite('Rulebook', '3', 'Communication Restrictions')],
    0.97
  ),
  q(
    'hanabi-deck-end',
    'hanabi',
    ['What happens when the Hanabi deck runs out?', 'How many turns are left after the last card is drawn?'],
    ['deck', 'empty', 'final'],
    'After the last card is drawn, each player, including the player who drew it, gets one final turn. Then the game ends and you total your firework score.',
    [cite('Rulebook', '5', 'End of the Game')],
    0.96
  ),
  q(
    'king-of-tokyo-healing',
    'king-of-tokyo',
    ['Can I heal while I am in Tokyo?', 'Do hearts work inside Tokyo?'],
    ['heal', 'tokyo', 'hearts'],
    'Normally no. Hearts heal your monster only while you are outside Tokyo unless a card or special effect says otherwise.',
    [cite('Rulebook', '4', 'Healing')],
    0.97
  ),
  q(
    'king-of-tokyo-claws',
    'king-of-tokyo',
    ['Who takes claw damage?', 'Do claws hit everyone or only Tokyo?'],
    ['claws', 'damage', 'tokyo'],
    'If you are outside Tokyo, your claws damage the monster in Tokyo. If you are in Tokyo, your claws damage every monster outside Tokyo.',
    [cite('Rulebook', '4', 'Smash!')],
    0.97
  ),
  q(
    'king-of-tokyo-yield',
    'king-of-tokyo',
    ['Can I leave Tokyo after I take damage?', 'When may the monster in Tokyo yield?'],
    ['leave', 'yield', 'damage'],
    'When the monster in Tokyo takes damage from another player, it may choose to yield and leave Tokyo, letting the attacker move in. Yielding does not happen after damage from cards unless that effect says it does.',
    [cite('Rulebook', '5', 'Yielding Tokyo')],
    0.95
  ),
  q(
    'sagrada-first-die',
    'sagrada',
    ['Where can my first die go?', 'Does the first die have to be on the edge of the window?'],
    ['first', 'die', 'edge'],
    'Yes. Your first die must be placed on an edge or corner space of your window pattern. Later dice must be adjacent to at least one die already in the window.',
    [cite('Rulebook', '4', 'Placing Dice')],
    0.96
  ),
  q(
    'sagrada-adjacent-restrictions',
    'sagrada',
    ['Can touching dice share the same number or color?', 'What adjacency rules matter in Sagrada?'],
    ['adjacent', 'number', 'color'],
    'Orthogonally adjacent dice may never share the same color or the same value. Diagonal touching is allowed and does not create that restriction.',
    [cite('Rulebook', '4', 'Placement Restrictions')],
    0.96
  ),
  q(
    'sagrada-tool-cost',
    'sagrada',
    ['Why does a tool card sometimes cost two favor tokens?', 'Does tool card cost increase after use?'],
    ['tool', 'favor', 'cost'],
    'The first time a tool card is used in a round, it costs one favor token. After that first use, the token on the card makes future uses cost two favor tokens instead.',
    [cite('Rulebook', '5', 'Tool Cards')],
    0.95
  ),
  q(
    'generic-strategy',
    null,
    ['What is the best move?', 'Should I do this?'],
    ['best', 'should', 'strategy'],
    'That sounds like strategy advice rather than an official rules ruling. I can still help, but I will treat it as table advice instead of a citation-backed answer.',
    [cite('RulesGenie Demo Mode', '—', 'Strategy Disclaimer')],
    0.74,
    'strategy',
    ['Ask a rules-specific question like “Can I?” or “When does this trigger?”']
  )
];
