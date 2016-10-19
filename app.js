var express = require('express');
var app = express();
var mysql = require('mysql');
var bodyParser = require('body-parser');
app.use(bodyParser());

app.set('view engine', 'pug');

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/app.html');
});

app.post('/', function(req, res) {
    var author = req.body.author;
    var connection = mysql.createConnection({
        host: '127.0.0.1',
        user: 'ieeevis',
        password: 'ieeevis',
        database: 'ieeevis'
    });
    var html = "";
    blacklist = [];
    connection.connect();
    connection.query('SELECT keyword from keyword_blacklist;',function(err,rows,fields){
        if (err) throw err;

        rows.forEach(function(item, index) {
            blacklist.push(item['keyword']);
        })
    });
    connection.query('SELECT b.keyword FROM `main` as a join `keyword` as b on a.id=b.id WHERE a.`Deduped author names` LIKE \'%' + author + '%\';', function(err, rows, fields) {
        if (err) throw err;

        var keywords = [];
        rows.forEach(function(item, index) {
            item['keyword'].split(',').forEach(function(item2, index2) {
                keywords.push(item2.trim());
            })
        })
        var counts = {};
        var temp = [];
		keywords.forEach(function(x) { counts[x] = (counts[x] || 0)+1; });
        var keysSorted = Object.keys(counts).sort(function(b,a){return counts[a]-counts[b]})
        keysSorted.forEach(function(item, index){
        	// html+=item+":"+counts[item]+"<br>";
            if(blacklist.indexOf(item)==-1)
                temp.push({"key":item,"count":counts[item]})
        })
        // res.send(html);
        res.render('result',{obj:temp,name:author});
    });

    connection.end();
});

app.get('/blacklist',function(req, res){
    var connection = mysql.createConnection({
        host: '127.0.0.1',
        user: 'ieeevis',
        password: 'ieeevis',
        database: 'ieeevis'
    });
    connection.connect();
    if(req.query.word){
        connection.query('INSERT INTO keyword_blacklist (keyword) VALUES (\''+req.query.word+'\');',function(err, rows, fields){
            if (err) throw err;
            res.send('<script>window.close();</script>');
        });
    }else if(req.query.del){
        connection.query('DELETE FROM keyword_blacklist WHERE keyword=\''+req.query.del+'\';',function(err, rows, fields){
            if (err) throw err;
            res.send('<script>window.close();</script>');
        });
    }else{
        var temp = [];
        connection.query('SELECT keyword from keyword_blacklist;',function(err, rows, fields){
            if (err) throw err;
            rows.forEach(function(item,index){
                temp.push({"key":item['keyword']});
            });
            res.render('blacklist',{obj:temp});
        });
    }
    connection.end();
});

app.listen(3000, function() {
    console.log('Example app listening on port 3000!');
});