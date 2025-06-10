const express = require('express');
const app = express();
const PORT = 3000;

let posts = [];

app.set('view engine', 'ejs');

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

// Home route
app.get('/', (req, res) => {
    res.render('index', { posts });
});

// New post form
app.get('/posts/new', (req, res) => {
    res.render('new');
});

// Handle post creation
app.post('/posts', (req, res) => {
    const { title, content, author } = req.body;

    if (!title || !content) {
        return res.send('Missing fields. Please go back and try again.');
    }

    const newEntry = {
        title,
        content,
        author: author,
        timestamp: new Date().toLocaleString()
    };

    posts.push(newEntry);
    res.redirect('/');
});

// Edit form
app.get('/posts/:index/edit', (req, res) => {
    const idx = parseInt(req.params.index, 10);
    const post = posts[idx];

    if (!post) {
        return res.status(404).send('Post not found, maybe it was deleted?');
    }

    res.render('edit', { post, index: idx });
});

// Handle edits
app.post('/posts/:index', (req, res) => {
    const idx = parseInt(req.params.index, 10);
    const { title, content } = req.body;

    if (!posts[idx]) {
        return res.status(404).send('Post no longer exists');
    }

    posts[idx].title = title || posts[idx].title;
    posts[idx].content = content || posts[idx].content;

    res.redirect('/');
});

// Delete post
app.post('/posts/:index/delete', (req, res) => {
    const idx = parseInt(req.params.index, 10);

    if (!posts[idx]) {
        return res.status(404).send('Nothing to delete here.');
    }

    posts.splice(idx, 1);
    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`Running the show at http://localhost:${PORT}`);
});