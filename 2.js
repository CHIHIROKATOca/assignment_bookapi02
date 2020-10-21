//https://api.nytimes.com/svc/books/v3/lists/{date}/{list}.json

$(function() {
    //6 ２つのvarをつくる
    let date;
    let displayName;
    let favouriteBooks = localStorage.getItem('favourite') ? JSON.parse(localStorage.getItem('favourite')) : [];
    //１・最初にこのgetBookDataとasyncを入れる
    const getBookData = async() =>{
        //3 try and catchをいれる
        try{
            var response =  await $.ajax({
                url : `https://api.nytimes.com/svc/books/v3/lists/current/hardcover-fiction.json?api-key=${config.API_KEY}`,
                type:"GET",
                dataType:"json",
            })
            date = response.results.published_date;
            displayName = response.results.list_name;
            //returnはsanitizeData(result);
            return sanitizeData(response);
        }catch(error){
            console.log(error)
        }
    }

    const checkFavourite = (item) => {
        const index = favouriteBooks.findIndex(e => e.isbn === item.isbn);
        return (index < 0) ? false : true;
    }

    //5 display dataをつくる。これはhtmlに表示させる内容
    const displayData = (data) =>{
        const isFavourite = checkFavourite(data);
        console.log(isFavourite)
        const header = $("header");
        const h1 = $("<h1></h1>").text(`List of ${displayName} books pulished in ${date}`);
        header.append(h1);
        const list = $(".listDiv");
        data.forEach((d)=>{
            const isFavourite = checkFavourite(d);
            const card = $('<div class="card col-lg-4 col-md-6" style="width:18rem"></div>').attr("id",d.isbn);
            const img = $('<img class="card-img-top">').attr('src',d.image);
            const cardBody = $('<div class = "card-body"></div>');
            const cardTitle = $('<div class = "card-title"></div>').attr("id",d.isbn);
            const cardText = $('<div class = "card-text"></div>');
            const bookText= $('<p></p>').text(d.description);
            const bookTitle = $('<h3></h3>').text(d.title);
            const bookRank = $('<h3></h3>').text(d.rank);
            const icon = isFavourite ? $('<i class="fas fa-heart favourite"></i>') : $('<i class="fas fa-heart"></i>');

            cardTitle.append(bookTitle);
            cardTitle.append(bookRank);
            cardTitle.append(icon);
            cardText.append(bookText);
            cardBody.append(cardTitle);
            cardBody.append(cardText);
            card.append(img);
            card.append(cardBody);

            list.append(card);
        })
    }

    //4 サニタイズデータをつくる.データのふるいをかける
    // プロパティをアレイから探すためにこれをつくる
    const sanitizeData = (data)=>{
        let bookData = [];
        data.results.books.forEach((book)=>{
            let b = {
                rank : book.rank,
                title : book.title,
                isbn : book.primary_isbn10,
                image : book.book_image,
                description : book.description,
                author : book.author,
                amazonURL : book.amazon_product_url
            };
            bookData.push(b);
        })
        return bookData;
    }

    //2 欲しいデータのpromiss(htmlで表示させたいもの)をつくる。
    let bookData=[];
    getBookData()
        // //7 displaydataを呼ぶ場所。 displayDataする。
        // displayData(value);
        // console.log(value);
        // console.log(displayName);
        // console.log(date);
            .then((value)=>{
            displayData(value);
            bookData = value;
        })
        .then(()=>{
            $('.fa-heart').click(e=>{
                const target = $(e.target);
                const targetId = target.parent().attr("id");

                const favBook = bookData.find(e=>e.isbn === targetId);
                const favIndex = favouriteBooks.findIndex(e => e.isbn === targetId);

                if(favIndex < 0){
                    favouriteBooks.push(favBook);
                }else{
                    favouriteBooks.splice(favIndex, 1);
                }
                // console.log(targetId);
                localStorage.setItem('favourite', JSON.stringify(favouriteBooks));
                target.toggleClass('favourite');

            })

    })
})