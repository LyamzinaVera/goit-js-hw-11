import Axios from 'axios';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import Notiflix from 'notiflix';



const form = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const loadBtn = document.querySelector(`.load-more`);

form.addEventListener('submit', onSearchForm);
loadBtn.addEventListener('click', loadItems);

let page = 1;
let name = ``;
loadBtn.style.display = `none`;

function onSearchForm(eve) {
    cleanPage();
    eve.preventDefault();
    name = eve.currentTarget.elements.searchQuery.value.trim();

    if (!name) {
        Notiflix.Notify.warning(`Please choose the animal`);
    } else {
        fetchUrl(name, page);
    }
}

async function fetchUrl(searchRequest, page = 1) {
    try {
        const API_KEY = '38482679-fa06f355fbbaefa388f4c969f';
        const URL = `https://pixabay.com/api/`;

        arrOfItems = await Axios.get(`${URL}`, {
            params: {
                key: `${API_KEY}`,
                image_type: 'photo',
                orientation: 'horizontal',
                safesearch: 'true',
                q: `${searchRequest}`,
                page: `${page}`,
                per_page: 40,

            },
        });
        console.log(arrOfItems);

        if (arrOfItems.data.totalHits > 0 && page === 1) {
            Notiflix.Notify.info(
                `Hooray! We found ${arrOfItems.data.totalHits} images.`
            );
        }

        if (arrOfItems.data.totalHits === 0) {
            Notiflix.Notify.failure(
                `Sorry, there are no images matching your search query. Please try again.`
            );
        }

        renderMarkUp(arrOfItems.data);

        new SimpleLightbox(`.gallery .photo-card`, {
            captionType: 'attr',
            captionsData: `alt`,
            captionDelay: 250,
        }).refresh();

    } catch (error) {
        Notiflix.Notify.warning(error);
    }
}


function renderMarkUp(arr) {
    const markUp = arr.hits.reduce((acc, hit) => {
        return (acc += `
         <div class="gallery_item">
          <a class="photo-card" href="${hit.largeImageURL}">
           <img class="gallery__img" src="${hit.webformatURL}" alt="${hit.tags}" loading="lazy" />
         </a>
         <a class="info">
          <p class="info-item"> Likes:${hit.likes}</p>
          <p class="info-item"> Views:${hit.views}</p>
          <p class="info-item"> Comments:${hit.comments}</p>
          <p class="info-item"> Downloads:${hit.downloads}</p>
         </a>
        </div>
        `);
    }, ``);

    gallery.innerHTML = '';
    gallery.innerHTML = markUp;

    if (arr.hits.length > 0) {
        loadBtn.style.display = ``;
    }

    if ((Math.floor(arr.totalHits / 40) < page) && arr.hits.length != 0) {
        loadBtn.style.display = 'none';
        Notiflix.Notify.info(
            "We're sorry, but you've reached the end of search results."
        );
    }
}

function loadItems() {
    fetchUrl(name, (page += 1));
}

function cleanPage() {
    loadBtn.style.display = `none`;
    gallery.innerHTML = ``;
    page = 1;
}