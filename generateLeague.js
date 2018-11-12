// Vlady Veselinov, Tested on Node v11.1.0
const fs = require('fs')
const data = JSON.parse(fs.readFileSync('data.json'))

// Get matches and flatten them to 1 array
let matches = data.rounds.map(round => round.matches)
matches = [].concat(...matches)

const teams = {}

const defaultTeam = {
  name: 'Default Name',
  wins: 0,
  draws: 0,
  defeats: 0,
  goalsFor: 0,
  goalsAgainst: 0,
  goalDifference: 0,
  points: 0,
}

function updateTeam(team, goalsFor = 0, goalsAgainst = 0) {
  const { key } = team

  delete team['key']
  delete team['code']

  const didWinNumber = goalsFor > goalsAgainst ? 1 : 0
  const didDrawNumber = goalsFor === goalsAgainst ? 1 : 0
  const didLoseNumber = goalsFor < goalsAgainst ? 1 : 0
  const goalDifference = goalsFor - goalsAgainst;
  let points = 0

  if (didWinNumber > 0) {
    points = 3
  } else if (didDrawNumber > 0) {
    points = 1
  }

  // Add team if missing
  if (!teams.hasOwnProperty(key)) {
    teams[key] = {
      ...defaultTeam,
      ...team,
      wins: didWinNumber,
      draws: didDrawNumber,
      defeats: didLoseNumber,
      goalsFor,
      goalsAgainst,
      goalDifference,
      points,
    }
  } else {
    const oldState = teams[key]

    teams[key] = {
      ...oldState,
      wins: oldState.wins + didWinNumber,
      draws: oldState.draws + didDrawNumber,
      defeats: oldState.defeats + didLoseNumber,
      goalsFor: oldState.goalsFor + goalsFor,
      goalsAgainst: oldState.goalsAgainst + goalsAgainst,
      goalDifference: oldState.goalDifference + goalDifference,
      points: oldState.points + points,
    }
  }
}

matches.forEach(match => {
  const { team1, team2, score1, score2 } = match

  updateTeam(team1, score1, score2)
  updateTeam(team2, score2, score1)
})

function compareTeams(team1, team2) {
  if (team1.points !== team2.points) {
    return team1.points - team2.points
  } else if (team1.goalDifference !== team2.goalDifference) {
    return team1.goalDifference - team2.goalDifference
  }
   
  return team1.goalsFor - team2.goalsFor
}

let sorted = Object.values(teams).sort(compareTeams).reverse()
sorted = sorted.map((team, index) => ({ rank: index + 1, ...team }))

fs.writeFile('results.json', JSON.stringify(sorted, null, 4), (error) => {
  if (error) {
    throw error;
  }

  console.log('Done. Look for results.json')
})

// Data taken from https://github.com/openfootball/football.json/blob/master/2016-17/en.1.json
// Results look correct comparing to this page https://www.flashscores.co.uk/football/england/premier-league-2016-2017/standings/
