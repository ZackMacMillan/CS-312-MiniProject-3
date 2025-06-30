const express = require('express');
const app = express();
const PORT = 3000;

const session = require('express-session');
const pool = require('./db');

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

app.use(session({
    secret: 'secret123',
    resave: false,
    saveUninitialized: false
}));

// Home route - Show all blog posts
app.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM blogs ORDER BY date_created DESC');
        res.render('index', { posts: result.rows, user: req.session.user_id });
    } catch (err) {
        console.error(err);
        res.send('Error loading posts.');
    }
});

// Sign up form
app.get('/signup', (req, res) => {
    res.render('signup');
});

// Handle sign up
app.post('/signup', async (req, res) => {
    const { user_id, password, name } = req.body;

    try {
        const existing = await pool.query('SELECT * FROM users WHERE user_id = $1', [user_id]);
        if (existing.rows.length > 0) {
            return res.send('That user ID is taken, pick another.');
        }

        await pool.query('INSERT INTO users (user_id, password, name) VALUES ($1, $2, $3)', [user_id, password, name]);
        res.redirect('/signin');
    } catch (err) {
        console.error(err);
        res.send('Something went wrong signing up.');
    }
});

// Sign in form
app.get('/signin', (req, res) => {
    res.render('signin');
});

// Handle sign in
app.post('/signin', async (req, res) => {
    const { user_id, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE user_id = $1 AND password = $2', [user_id, password]);
        
        if (result.rows.length === 0) {
            return res.send('Wrong user ID or password.');
        }

        req.session.user_id = result.rows[0].user_id;
        req.session.name = result.rows[0].name;

        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.send('Error signing in.');
    }
});

// New post form
app.get('/posts/new', (req, res) => {
    if (!req.session.user_id) {
        return res.redirect('/signin');
    }
    res.render('new');
});

// Handle post creation
app.post('/posts', async (req, res) => {
    const { title, content } = req.body;

    if (!title || !content) {
        return res.send('Missing fields. Please go back and try again.');
    }

    try {
        await pool.query(
            'INSERT INTO blogs (creator_name, creator_user_id, title, body) VALUES ($1, $2, $3, $4)',
            [req.session.name, req.session.user_id, title, content]
        );
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.send('Couldn\'t save your post.');
    }
});

// Edit form
app.get('/posts/:id/edit', async (req, res) => {
    const id = req.params.id;

    try {
        const result = await pool.query('SELECT * FROM blogs WHERE blog_id = $1', [id]);
        const post = result.rows[0];

        if (!post) {
            return res.status(404).send('Post not found.');
        }

        if (post.creator_user_id !== req.session.user_id) {
            return res.send('Nice try, but you can only edit your own posts.');
        }

        res.render('edit', { post });
    } catch (err) {
        console.error(err);
        res.send('Error loading post.');
    }
});

// Handle edits
app.post('/posts/:id', async (req, res) => {
    const id = req.params.id;
    const { title, content } = req.body;

    try {
        const result = await pool.query('SELECT * FROM blogs WHERE blog_id = $1', [id]);
        const post = result.rows[0];

        if (!post) {
            return res.status(404).send('Post not found.');
        }

        if (post.creator_user_id !== req.session.user_id) {
            return res.send('You can only edit your own posts.');
        }

        await pool.query(
            'UPDATE blogs SET title = $1, body = $2 WHERE blog_id = $3',
            [title || post.title, content || post.body, id]
        );

        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.send('Couldn\'t update the post.');
    }
});

// Delete post
app.post('/posts/:id/delete', async (req, res) => {
    const id = req.params.id;

    try {
        const result = await pool.query('SELECT * FROM blogs WHERE blog_id = $1', [id]);
        const post = result.rows[0];

        if (!post) {
            return res.status(404).send('Post not found.');
        }

        if (post.creator_user_id !== req.session.user_id) {
            return res.send('You can only delete your own posts.');
        }

        await pool.query('DELETE FROM blogs WHERE blog_id = $1', [id]);
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.send('Couldn\'t delete the post.');
    }
});

app.listen(PORT, () => {
    console.log(`Running the show at http://localhost:${PORT}`);
});
