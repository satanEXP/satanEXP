require('dotenv').config()

const Snoowrap = require('snoowrap')
const Snoostorm = require('snoostorm')
const fs = require('fs')

const r = new Snoowrap({
    userAgent: 'reddit-bot-example-node',
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    username: process.env.REDDIT_USER,
    password: process.env.REDDIT_PASS
});
const client = new Snoostorm(r);

const streamOpts = {
    subreddit: 'all',
    results: 200
};

const comments = client.CommentStream(streamOpts);

let rawdata = fs.readFileSync('data.json')
let data = JSON.parse(rawdata)

let exp = data.exp;
let level = data.level;
let nextMult = data.nextMult;
let nextExp = level * nextMult;

const reply = (comment, count) => {

    if (exp < nextExp) {
        return `/u/${comment.author.name} uses "Mormon". It's super effective!\n\nSatan is victorious. LV${level} Satan gains ${count} exp.\n\nExp until next level: ${exp}/${nextExp}\n\n ^(This is a bot. [Click here to find out what this is about.](https://www.nytimes.com/aponline/2018/10/07/us/ap-us-rel-mormon-conference-church-name.html))`        
    } else if (exp >= nextExp) {
        level++;
        nextExp = level * 100
        return `/u/${comment.author.name} uses "Mormon". It's super effective!\n\nSatan is victorious. Satan gains ${count} exp.\n\nSatan levels up to LV${level}! Exp until next level: ${exp}/${nextExp}\n\n ^(This is a bot. [Click here to find out what is this about.](https://www.nytimes.com/aponline/2018/10/07/us/ap-us-rel-mormon-conference-church-name.html))`
    }
}

const saveData = (exp, level) => {
    let data = JSON.stringify({
        exp,
        level,
        nextMult 
    })
    fs.writeFileSync('data.json', data)
}

const checkFalseFlags = (comment) => {
    if (comment.body.toLowerCase().includes('mormont')){
        return false
    } else if (comment.author.name.toLowerCase() == 'satanexp' ) {
        return false
    } else if (comment.body.toLowerCase().includes('exmormon')) {
        return false
    } else if (comment.body.toLowerCase().includes('mormon')) {
        return true
    } else {
        return false
    }
}

comments.on('comment', (comment) => {
    if (checkFalseFlags(comment)) {
        console.log(`****${comment.subreddit_name_prefixed} - ${comment.link_title}****`);
        console.log(`****${comment.body}**** \n`);
        const count = (comment.body.toLowerCase().match(/mormon/g) || []).length
        exp+=count;
        saveData(exp, level);
        const replyMessage = reply(comment, count)
        comment.reply(replyMessage)
    }   
})
