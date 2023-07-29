
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';
import Notiflix from 'notiflix';

const gallery = document.querySelector(`.gallery`);
const form = document.querySelector(`.search-form`);
const loadMoreBtn = document.querySelector(`.load-more`);

form.addEventListener(`submit`, onSearchForm);
loadMoreBtn.addEventListener(`click`, loadMoreItems);

let lightbox;
let page = 1;
let name = ``;
loadMoreBtn.style.display = `none`;

lightbox = new SimpleLightbox('.gallery .photo-card', {
    captionType: 'attr',
    captionsData: 'alt',
    captionDelay: 250,
});


async function onSearchForm(eve) {
    cleanPage();
    eve.preventDefault();
    name = eve.currentTarget.elements.searchQuery.value.trim();

    if (!name) {
        Notiflix.Notify.warning(`Please choose the animal`);
    } else {
        try {
            const data = await fetchUrl(name, page);
            if (data.totalHits > 0 && page === 1) {
                Notiflix.Notify.info(`Hooray! We found ${data.totalHits} images.`);
            }

            if (data.totalHits === 0) {
                Notiflix.Notify.failure(
                    `Sorry, there are no images matching your search query. Please try again.`
                );
            }
            // updateGallery();
        } catch (error) {
            Notiflix.Notify.warning(error.message);
        }
    }
}

function updateGallery() {
    if (lightbox) {
        lightbox.refresh();
    }
}


async function fetchUrl(searchRequest, page = 1) {
    try {
        const API_KEY = '38482679-fa06f355fbbaefa388f4c969f';
        const URL = `https://pixabay.com/api/`;

        const arrOfItems = await axios.get(`${URL}`, {
            params: {
                key: `${API_KEY}`,
                q: `${searchRequest}`,
                image_type: `photo`,
                safesearch: `true`,
                orientation: `horizontal`,
                page: `${page}`,
                per_page: 40,
            },
        });




        renderMarkUp(arrOfItems.data);

        // new SimpleLightbox(`.gallery .photo-card`, {
        //     captionType: 'attr',
        //     captionsData: `alt`,
        //     captionDelay: 250,
        // }).refresh();

        return arrOfItems.data;

    } catch (error) {
        Notiflix.Notify.warning(error);
    }
}

function renderMarkUp(arr) {
    const markUp = arr.hits.map(hit =>
        `
    <div class="gallery__item" >
      <a class="photo-card" href="${hit.largeImageURL}">
        <img class="gallery__img" src="${hit.webformatURL}" alt="${hit.tags}" loading="lazy" />
      </a>
      <a class="info">
        <p class="info-item"> Likes:${hit.likes}</p>
        <p class="info-item">Views:${hit.views}</p>
        <p class="info-item">Comments:${hit.comments}</p>
        <p class="info-item">Downloads:${hit.downloads}</p>
      </a>
    </div>
    `
    ).join('');

    gallery.insertAdjacentHTML('beforeend', markUp);

    if (arr.hits.length > 0) {
        loadMoreBtn.style.display = ``;
    }
    if (Math.floor(arr.totalHits / 40) < page && arr.hits.length != 0) {
        loadMoreBtn.style.display = 'none';
        Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
    }
    updateGallery();
}

function loadMoreItems() {
    fetchUrl(name, (page += 1));
}


function cleanPage() {
    loadMoreBtn.style.display = `none`;
    gallery.innerHTML = ``;
    page = 1;
}

