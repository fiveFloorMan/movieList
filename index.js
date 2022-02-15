const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12
let currentPage = 1

const movies = [] //電影總清單
let filteredMovies = [] //電影搜尋時的清單

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

const modeChangesSwitch = document.querySelector('#change-mode')


function renderMovieList(data) {
  let rawHTML = ''

  data.forEach((item) => {
    // title, image
    if (dataPanel.dataset.mode === "list-mode"){
    rawHTML += `
    <div class="container mt-1 mb-1">
      <div class="card">
        <div class="card-body align-items-start">
          <div class="row">
            <div class="col-9">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="col">
              <button type="button" class="btn btn-primary btn-show-movie" data-bs-toggle ="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-show-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    `
    } else if (dataPanel.dataset.mode === "card-mode"){
      rawHTML += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img src="${POSTER_URL + item.image}" class="card-img-top"
              alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button type="button" class="btn btn-primary btn-show-movie" data-bs-toggle ="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-show-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>
    `
    }
  })
  dataPanel.innerHTML = rawHTML
}

// math.ceil(數字) => 讓數字無條件進位
// amout = 電影數量 ; numberOfpages = 共有多少頁數
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''
  for (let page = 0; page < numberOfPages; page++) {
    rawHTML += `
      <li class="page-item"><a class="page-link" href="#" data-page=${page + 1}>${page + 1}</a></li>
    `
  }
  paginator.innerHTML = rawHTML
}

// page -> MOVIES_PER_PAGE所設定的數量,成為一頁
// 
function getMoviesByPage(page) {
  // filteredMovies 是否有搜尋? 有的話用filteredMovies當data ; 沒有就用movies
  const data = filteredMovies.length ? filteredMovies : movies 
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then(response => {
    // response.data.results
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `
      <img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fuid">
    `
  })
}

function addToFavorite(id) {
  function isMovieIdMatched(movie) {
    return movie.id === id
  }
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || []
  const movie = movies.find(isMovieIdMatched)

  // movie 部分如果是箭頭函式的話寫成
  // const movie = movies.find((movie) => movie.id === id)
  if (list.some(isMovieIdMatched)) {
    return alert("這部已經加過了喔")
  }

  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

// 在id="movie-modal"的模式上, 安裝選擇呈現方式的dataset
function changesDisplayMode(displayMode){
  if (dataPanel.dataset.mode === displayMode) return
  dataPanel.dataset.mode = displayMode
}

// 監聽切換事件
modeChangesSwitch.addEventListener('click', function switchClick(event){
    if (event.target.matches('#card-mode-button')){
      changesDisplayMode('card-mode')
      renderMovieList(getMoviesByPage(currentPage))
    } else if (event.target.matches('#list-mode-button')){
      changesDisplayMode('list-mode')
      renderMovieList(getMoviesByPage(currentPage))
    }
})

// 監聽data panel點擊, 出現詳細資料的modal
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-show-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

// 監聽分頁點擊
paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  // 上一句的意思是 如果點擊的目標不是<a></a> , 就不執行這行程式
  // tagName 就是指標籤
  else {
    const page = Number(event.target.dataset.page)
    currentPage = page
    renderMovieList(getMoviesByPage(currentPage))
  }
})

// 監聽 search bar
searchForm.addEventListener('submit', function onSearchFormSubmited(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  for (const movie of movies) {
    if (movie.title.toLowerCase().includes(keyword)) {
      filteredMovies.push(movie)
    }
  }

  if (filteredMovies.length === 0) {
    return alert('The movie cannot find')
  }
  currentPage = 1
  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(currentPage))
})

  axios.get(INDEX_URL).then(response => {
  // Array(80)
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(currentPage))
})
