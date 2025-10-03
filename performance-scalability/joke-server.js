const http = require("http");
const port = parseInt(process.argv[2] || "3000");

const jokes = [
    // "Why don't skeletons fight each other? They don't have the guts.",
    // "I'm reading a book about anti-gravity. It's impossible to put down!",
    // "Why did the scarecrow win an award? Because he was outstanding in his field!",
    // "Why don’t scientists trust atoms? Because they make up everything!",
    "What do you call fake spaghetti? An impasta!",
];

const server = http.createServer((req, res) => {
    const randomIndex = Math.floor(Math.random() * jokes.length);
    const joke = jokes[randomIndex];

    const responsePayload = JSON.stringify({
        joke,
        port,
        processID: process.pid,
    });

    console.log(responsePayload);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(responsePayload);
});

server.listen(port, () => {
    console.log(`Joke server is running on port ${port}`);
});
