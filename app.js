const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

let posts = [];

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));

console.log('Current working directory:', process.cwd());

app.get('/', (req, res) => {
  res.render('index', { posts });
});

app.get('/posts/new', (req, res) => {
  res.render('new');
});

app.post('/posts', (req, res) => {
  const newPost = {
    title: req.body.title,
    content: req.body.content,
  };

  posts.push(newPost);
  res.redirect('/');
});

app.get('/posts/:index/edit', (req, res) => {
  const index = req.params.index;
  const post = posts[index];

  if (!post) {
    return res.status(404).send('Post not found');
  }

  res.render('edit', { post, index });
});

app.post('/posts/:index', (req, res) => {
  const index = req.params.index;

  if (!posts[index]) {
    return res.status(404).send('Post not found');
  }

  
  posts[index] = {
    title: req.body.title,
    content: req.body.content,
  };

  
  res.redirect('/');
});

app.post('/posts/:index/delete', (req, res) => {
  const index = req.params.index;

  if (!posts[index]) {
    return res.status(404).send('Post not found');
  }

  
  posts.splice(index, 1);

  
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});