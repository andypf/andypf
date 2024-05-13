const fs = require("node:fs")
const { STATS_KEY } = require("./constants")

// Usage: node get_data.js --user=USERNAME --gh-token=GITHUB_TOKEN --file=stats/data.json

// default argument values
const options = {
  user: null,
  ghToken: null,
  file: null,
}

process.argv.slice(2).forEach((arg) => {
  const [key, value] = arg.split("=")
  switch (key) {
    case "--user":
      options.user = value
      break
    case "--gh-token":
      options.ghToken = value
      break
    case "--file":
      options.file = value
      break
  }
})

// handle the fetching of data
// returns a promise
function fetchData(query) {
  return fetch("https://api.github.com/graphql", {
    headers: {
      Authorization: `Bearer ${options.ghToken}`,
    },
    method: "POST",
    body: JSON.stringify({
      query,
    }),
  }).then((res) => res.json())
}

// build the query string for the user data
function getUserData() {
  return `{
      user(login: "${options.user}") {
        createdAt
        name
        repositories(first: 100) {
          nodes {
            name
            owner {
              login
            }
            stargazerCount
            languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
              edges {
                size
                node {
                  color
                  name
                }
              }
            }
          }
        }
        issues {
          totalCount
        }
        pullRequests {
          totalCount
        }
        repositoriesContributedTo{
          totalCount
        }
      }
    }`
}

// build the query string for the contribution data
function getContributionData(year) {
  return `{
    user(login: "${options.user}") {
      contributionsCollection(from: "${year}-01-01T00:00:00Z"){
        totalCommitContributions
        totalIssueContributions
      }
    }
  }`
}

async function loadData() {
  // fetch user data
  // it gives us the user's repositories, issues, pull requests, etc
  const userData = await fetchData(getUserData()).catch((error) => console.error(error))
  // console.log("==",userData)
  // initialize the stats, count the stars, languages and most contributed to repos
  let starsCount = 0,
    languages = {}
  mostContributedTo = {}

  // loop through the user's repositories
  for (let repo of userData.data.user.repositories.nodes) {
    // if the repo owner is the user, add the stars to the count
    if (repo.owner.login === options.user) {
      starsCount += repo.stargazerCount
    }

    // loop through the languages of the repo
    for (let language of repo.languages.edges) {
      // if the language is not in the languages object, add it
      languages[language.node.name] = languages[language.node.name] || {
        name: language.node.name,
        color: language.node.color,
        size: 0,
      }
      // add the size of the language to the total size
      languages[language.node.name].size += language.size
    }

    // add the repo to the mostContributedTo object
    mostContributedTo[repo.name] = {
      owner: repo.owner.login,
      name: repo.name,
      totalSize: 0,
    }
    // loop through the languages of the repo
    mostContributedTo[repo.name].languages = repo.languages.edges.map(
      (lang) => {
        // add the size of the language to the total size
        mostContributedTo[repo.name].totalSize += lang.size
        return {
          name: lang.node.name,
          color: lang.node.color,
          size: lang.size,
        }
      }
    )
  }

  // get total commits count from the start year to the current year
  // the start year is the year the user created their account
  // const startYear = userData.data.user.createdAt.split("T")[0]
  const startYear = new Date(userData.data.user.createdAt).getFullYear()
  let totalCommitsCount = 0
  // from startYear to current year fetch contribution data
  // for each year from the startYear
  for (let year = startYear; year <= new Date().getFullYear(); year++) {
    const contributionData = await fetchData(getContributionData(year))
    totalCommitsCount +=
      contributionData.data.user.contributionsCollection
        .totalCommitContributions
  }

  //console.log(JSON.stringify(userData, null, 2))
  return {
    [STATS_KEY.USER_NAME]: userData.data.user.name,
    [STATS_KEY.ISSUES]: userData.data.user.issues.totalCount,
    [STATS_KEY.PULL_REQUESTS]: userData.data.user.pullRequests.totalCount,
    [STATS_KEY.CONTRIBUTED_TO]:
      userData.data.user.repositoriesContributedTo.totalCount,
    [STATS_KEY.STARS]: starsCount,
    [STATS_KEY.COMMITS]: totalCommitsCount,
    [STATS_KEY.LANGUAGES]: Object.values(languages),
    [STATS_KEY.MOST_CONTRIBUTED_TO]: Object.values(mostContributedTo),
  }
}

console.log("GET DATA")
console.log("Fetching data...")
loadData().then((data) => {
  // create folder of file recursively if not exists
  const folder = options.file.split("/").slice(0, -1).join("/")
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true })
  }
  console.log(`Writing data to ${options.file}...`)
  // store data to stats/data.json
  fs.writeFileSync(options.file, JSON.stringify(data, null, 2))
  console.log("DONE!")
}).catch((error) => console.error(error))

