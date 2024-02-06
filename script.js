
function likeToggle(likebutton){
    var likecounter = document.getElementById('like-counter');
    console.log(likebutton.innerHTML);

    if(likebutton.classList.contains('liked')){
        likebutton.classList.remove('liked');
        likebutton.src = 'icons/unlike.svg';
        likecounter.innerHTML = parseInt(likecounter.innerHTML) - 1;
    }else{
        likebutton.classList.add('liked');
        likebutton.src = 'icons/like.svg';
        likecounter.innerHTML = parseInt(likecounter.innerHTML) + 1;
    }
}

function modeToggle(){
    var icon = document.getElementById('viewid');

    document.body.classList.toggle('light-mode');

    if(document.body.classList.contains('light-mode')){
        icon.src = 'icons/moon.svg';
    }else{
        icon.src = 'icons/sun.svg';
    }
}

function showSection(sectionid){
    var sectionToHide = document.getElementsByClassName('active');
    sectionToHide[0].classList.remove('active');

    var sectionToShow = document.getElementById(sectionid);
    sectionToShow.classList.add('active');
}