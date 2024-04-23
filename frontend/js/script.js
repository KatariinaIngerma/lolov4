
async function fetchData() {
    try {
        const response = await fetch('http://localhost:3000');
        const data = await response.json();
        const feedContainer = document.getElementById('feed');
        data.forEach(item => {
            const feedItem = document.createElement('div');
            feedItem.classList.add('feed-item');
            feedItem.dataset.categories = item.categories.join(' ');
            const title = document.createElement('h2');
            const link = document.createElement('a');
            const description = document.createElement('p');
            const pubDate = document.createElement('p');
            const categories = document.createElement('p');
            const authorDiv = document.createElement('div');
            const author = document.createElement('p');
            const authorImage = document.createElement('img');
            const image = document.createElement('img');

            title.textContent = item.title;
            link.textContent = 'Read more';
            link.href = item.link;
            link.target = '_blank';
            description.textContent = item.description;
            pubDate.textContent = 'Published Date: ' + item.pubDate;
            categories.textContent =item.categories.join(', ');
            author.textContent = item.author;

            if (author.textContent !== "") {
                authorImage.src = './assets/icons8-male-user-16.png'; // Assuming the image is located at './assets/icons8-male-user-16.png'
                authorImage.alt = 'Author Image';

                authorDiv.classList.add('author-info');
                authorDiv.appendChild(authorImage);
                authorDiv.appendChild(author);
            }
            feedItem.appendChild(categories);
            if (item.media) {
                image.src = item.media;
                image.alt = item.title;
                feedItem.appendChild(image);
            }
            
            feedItem.appendChild(title);
            feedItem.appendChild(link);
            feedItem.appendChild(description);
            feedItem.appendChild(pubDate);
            feedItem.appendChild(authorDiv);

            feedContainer.appendChild(feedItem);
        });
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

fetchData();

function filterByCategory(category) {
    const items = document.querySelectorAll('.feed-item');
    items.forEach(item => {
        const categories = item.dataset.categories
        if (category === '' || categories.includes(category)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}