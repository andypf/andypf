const { STATS_KEY } = require("./constants")
const fs = require("node:fs")

// Usage: node generate_svgs.js --src=stats/data.json --outdir=stats
const options = {
  src: null,
  outdir: null,
}

process.argv.slice(2).forEach((arg) => {
  const [key, value] = arg.split("=")
  switch (key) {
    case "--src":
      options.src = value
      break
    case "--outdir":
      options.outdir = value
      break
  }
})

const darkTheme = {
  bg: "#151515",
  bg2: "#333",
  border: "#e4e2e2",
  primary: "#fff",
  secondary: "#9f9f9f",
  icon: "#79ff97",
}

const lightTheme = {
  bg: "#fffefe",
  bg2: "#ddd",
  border: "#e4e2e2",
  primary: "#2f80ed",
  secondary: "#434d58",
  icon: "#4c71f2",
}

function styles(theme) {
  return `
  .header {
    font-weight: bold;
    font-family: sans-serif;
    font-size: 18px;
    fill: ${theme.primary};
  }

  .text {
    font-family: sans-serif;
    fill: ${theme.secondary};
    font-size: 14px;
  }
  .small {
    font-size: 12px;
  }

  .icon {
    fill: ${theme.icon};
  }

  .fade-in {
    opacity: 0;
    animation: fadeInAnimation 0.8s ease-in-out forwards;
  } 
  @keyframes fadeInAnimation {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`
}
function displayNumber(number) {
  if (number >= 1000000) return "~" + (number / 1000000).toFixed(1) + "m"
  if (number >= 1000) return "~" + (number / 1000).toFixed(1) + "k"
  return number
}

function displayBytes(number) {
  if (number >= 1024 * 1024)
    return "~" + (number / 1024 / 1024).toFixed(1) + "m"
  if (number >= 1024) return "~" + (number / 1024).toFixed(1) + "k"
  return number
}

function generateOverviewSVG(stats, theme) {
  let svg = `  
  <svg xmlns="http://www.w3.org/2000/svg" width="320" height="195" viewBox="0 0 320 195" fill="none" role="img">
  <title>
    ${stats[STATS_KEY.USER_NAME]}'s GitHub Stats
  </title>
  <style>${styles(theme)}</style>
  <rect class="container" x="0" y="0" width="100%" height="100%" rx="4.5" fill="${
    theme.bg
  }" stroke="${theme.border}">
  </rect>
  <g transform="translate(25,35)">
    <text class="header fade-in">
      ${stats[STATS_KEY.USER_NAME]}'s GitHub Stats
    </text>
  </g>
  <g transform="translate(25,55)">
    <g class="fade-in" style="animation-delay: 450ms"> 
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" version="1.1" width="16" height="16" class="icon">
        <path fill-rule="evenodd" d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-3.097.45 2.24 2.184a.75.75 0 01.216.664l-.528 3.084 2.769-1.456a.75.75 0 01.698 0l2.77 1.456-.53-3.084a.75.75 0 01.216-.664l2.24-2.183-3.096-.45a.75.75 0 01-.564-.41L8 2.694v.001z"/>
      </svg>

      <text class="text" x="25" y="12.5">Total Stars Earned:</text>
      <text class="text" x="220" y="12.5">${displayNumber(
        stats[STATS_KEY.STARS]
      )}</text>
    </g>  
    <g class="fade-in" style="animation-delay: 750ms" transform="translate(0,25)"> 
      <svg xmlns="http://www.w3.org/2000/svg" data-testid="icon" class="icon" viewBox="0 0 16 16" version="1.1" width="16" height="16">
        <path fill-rule="evenodd" d="M1.643 3.143L.427 1.927A.25.25 0 000 2.104V5.75c0 .138.112.25.25.25h3.646a.25.25 0 00.177-.427L2.715 4.215a6.5 6.5 0 11-1.18 4.458.75.75 0 10-1.493.154 8.001 8.001 0 101.6-5.684zM7.75 4a.75.75 0 01.75.75v2.992l2.028.812a.75.75 0 01-.557 1.392l-2.5-1A.75.75 0 017 8.25v-3.5A.75.75 0 017.75 4z"/>
      </svg>

      <text class="text" x="25" y="12.5">Total Commits:</text>
      <text class="text" x="220" y="12.5">${displayNumber(
        stats[STATS_KEY.COMMITS]
      )}</text>
    </g> 
    <g class="fade-in" style="animation-delay: 1050ms" transform="translate(0,50)"> 
      <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 16 16" version="1.1" width="16" height="16">
        <path fill-rule="evenodd" d="M7.177 3.073L9.573.677A.25.25 0 0110 .854v4.792a.25.25 0 01-.427.177L7.177 3.427a.25.25 0 010-.354zM3.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122v5.256a2.251 2.251 0 11-1.5 0V5.372A2.25 2.25 0 011.5 3.25zM11 2.5h-1V4h1a1 1 0 011 1v5.628a2.251 2.251 0 101.5 0V5A2.5 2.5 0 0011 2.5zm1 10.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM3.75 12a.75.75 0 100 1.5.75.75 0 000-1.5z"/>
      </svg>

      <text class="text" x="25" y="12.5">Total PRs:</text>
      <text class="text" x="220" y="12.5">${displayNumber(
        stats[STATS_KEY.PULL_REQUESTS]
      )}</text>
    </g> 
    <g class="fade-in" style="animation-delay: 1350ms" transform="translate(0,75)"> 
      <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 16 16" version="1.1" width="16" height="16">
        <path fill-rule="evenodd" d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm9 3a1 1 0 11-2 0 1 1 0 012 0zm-.25-6.25a.75.75 0 00-1.5 0v3.5a.75.75 0 001.5 0v-3.5z"/>
      </svg>

      <text class="text" x="25" y="12.5">Total Issues:</text>
      <text class="text" x="220" y="12.5">${displayNumber(
        stats[STATS_KEY.ISSUES]
      )}</text>
    </g> 
    <g class="fade-in" style="animation-delay: 1650ms" transform="translate(0,100)"> 
      <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 16 16" version="1.1" width="16" height="16">
        <path fill-rule="evenodd" d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"/>
      </svg>

      <text class="text" x="25" y="12.5">Contributed to (last year):</text>
      <text class="text" x="220" y="12.5">${displayNumber(
        stats[STATS_KEY.CONTRIBUTED_TO]
      )}</text>
    </g> 
  </g>
  

</svg>`
  return svg
}

function generateLanguagesSVG(stats, theme) {
  // sort by size
  let mostUsedLang = stats[STATS_KEY.LANGUAGES]
    .sort((a, b) => b.size - a.size)
    .slice(0, 5)

  const height = 60 + 35 * mostUsedLang.length
  const totalSize = mostUsedLang.reduce((sum, l) => (sum += l.size), 0)

  // console.log(stats[STATS_KEY.LANGUAGES], mostUsedLang, totalSize)
  let svg = `  
  <svg xmlns="http://www.w3.org/2000/svg" width="320" height="${height}" viewBox="0 0 320 ${height}" fill="none" role="img">
    <title>
      Most Used Languages
    </title>
    <style>${styles(theme)}</style>
    <rect class="container" x="0" y="0" width="100%" height="100%" rx="4.5" fill="${
      theme.bg
    }" stroke="${theme.border}">
    </rect>
    <g transform="translate(25,35)">
      <text class="header fade-in">
        Most Used Languages
      </text>
    </g>
    ${mostUsedLang
      .map((lang, index) => {
        const percent = ((lang.size / totalSize) * 100).toFixed(1)
        return `
        <g class="fade-in" style="animation-delay: ${
          450 + index * 300
        }ms" transform="translate(25,${60 + index * 35})">
        
          <text class="text small">${lang.name}</text>
          <g transform="translate(0,10)">
            <rect fill="${
              theme.bg2
            }" height="8" rx="5" ry="5" width="195" x="0" y="0"/>
            <rect fill="${lang.color}" height="8" rx="5" ry="5" width="${
          (lang.size / totalSize) * 195
        }" x="0.0" y="0"/>
          </g>
          <text class="text small" x="220" y="18">${percent}% </text>
        </g>
      `
      })
      .join(" ")}

  </svg>  
  `
  return svg
}

function generateTopReposSVG(stats, theme) {
  // sort by size
  let topRepos = stats[STATS_KEY.MOST_CONTRIBUTED_TO]
    .sort((a, b) => b.totalSize - a.totalSize)
    .slice(0, 5)

  const height = 60 + 35 * topRepos.length
  const totalSize = topRepos.reduce((sum, l) => (sum += l.totalSize), 0)

  let svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="320" height="${height}" viewBox="0 0 320 ${height}" fill="none" role="img">
    <title>
      Top Repositories
    </title>
    <style>${styles(theme)}</style>
    <rect class="container" x="0" y="0" width="100%" height="100%" rx="4.5" fill="${
      theme.bg
    }" stroke="${theme.border}">
    </rect>
    <g transform="translate(25,35)">
      <text class="header fade-in">
        Top Repositories
      </text>
    </g>
    ${topRepos
      .map((repo, index) => {
        const percent = ((repo.totalSize / totalSize) * 100).toFixed(1)
        return `
        <g class="fade-in" style="animation-delay: ${
          450 + index * 300
        }ms" transform="translate(25,${60 + index * 35})">

          <text class="text small">${repo.owner}/${repo.name}</text>
          <g transform="translate(0,10)">
            <rect fill="${
              theme.bg2
            }" height="8" rx="5" ry="5" width="195" x="0" y="0"/>
            <rect fill="${theme.primary}" height="8" rx="5" ry="5" width="${
          (repo.totalSize / totalSize) * 195
        }"/>
          </g>
          <text class="text small" x="220" y="18">${percent}%</text>
        </g>
      `
      })
      .join(" ")}

  </svg>
  `
  return svg
}

console.log("GENERATE SVGs")
console.log(`Load ${options.src}`)
// load file from options.src
const stats = JSON.parse(fs.readFileSync(options.src))
console.log("Generating...")

// create outdir folder if not exists
if (!fs.existsSync(options.outdir)) {
  fs.mkdirSync(options.outdir)
}

const overviewDark = generateOverviewSVG(stats, darkTheme)
const overviewLight = generateOverviewSVG(stats, lightTheme)
const languagesDark = generateLanguagesSVG(stats, darkTheme)
const languagesLight = generateLanguagesSVG(stats, lightTheme)
const topReposDark = generateTopReposSVG(stats, darkTheme)
const topReposLight = generateTopReposSVG(stats, lightTheme)

console.log(`Write overview svg to ${options.outdir}`)
// write overview svg to outdir/overview.svg
fs.writeFileSync(`${options.outdir}/overview_dark.svg`, overviewDark)
fs.writeFileSync(`${options.outdir}/overview_light.svg`, overviewLight)
fs.writeFileSync(`${options.outdir}/languages_dark.svg`, languagesDark)
fs.writeFileSync(`${options.outdir}/languages_light.svg`, languagesLight)
fs.writeFileSync(`${options.outdir}/top_repos_dark.svg`, topReposDark)
fs.writeFileSync(`${options.outdir}/top_repos_light.svg`, topReposLight)
console.log("DONE!")
