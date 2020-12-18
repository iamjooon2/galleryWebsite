// 메뉴 이동
let my_info = null;
let photos = null;

function setMenu(_menu) {
  var filterButtons = document.querySelectorAll("nav li");
  filterButtons.forEach(function (filterButton) {
    filterButton.classList.remove("on");
  });
  document.querySelector("nav li." + _menu).classList.add("on");
  document.querySelector("main").className = _menu;
}

// 정렬 방식
let sorts = {
  recent: function (a, b) {
    return (a.idx > b.idx) ? -1 : 1;
  },
  like: function (a, b) {
    return (a.likes > b.likes) ? -1 : 1;
  },
}

// 현재 선택된 정렬
let sort = sorts.recent;

// 정렬 설정 & 적용
function setSort(_sort) {
  let sortButtons = document.querySelectorAll("#sorts li");
  sortButtons.forEach(function (sortButton) {
    sortButton.classList.remove('on');
  });
  document.querySelector("#sorts ." + _sort).classList.add("on");
  sort = sorts[_sort];
  showPhotos();
}

// 필터 방식
let filters = {
  all: function (it) {
    return true;
  },
  mine: function (it) {
    return it.user_id === my_info.id;
  },
  like: function (it) {
    return my_info.like.indexOf(it.idx) > -1;
  },
  follow: function (it) {
    return my_info.follow.indexOf(it.user_id) > -1;
  },
}

// 현재 선택된 필터
let filter = filters.all;


// 필터 설정 & 적용
function setFilter(_filter) {
  var filterButtons = document.querySelectorAll("#filters li");
  filterButtons.forEach(function (filterButton) {
    filterButton.classList.remove("on");
  });
  document.querySelector("#filters ." + _filter).classList.add("on");
  filterName = _filter;
  loadPhotos();
}



// 사진들 새로 보여주기
function showPhotos() {
  // 현재 화면의 사진들 삭제
  var existingNodes = document.querySelectorAll("#gallery article:not(.hidden)");
  existingNodes.forEach(function (existingNode) {
    existingNode.remove();
  });

  // 갤러리 div 선택
  var gallery = document.querySelector("#gallery");

  //var filtered = photos.filter(filter);
  let filtered = photos;
  filtered.sort(sort);

  
  
  // 필터된 사진들 화면에 나타내기
  filtered.forEach(function (photo) {
    let photoNode = document.querySelector("article.hidden").cloneNode(true);
    //photoNode는 hidden 클래스들 사본떠오는 것!!!!
    
    photoNode.classList.remove("hidden");
    photoNode.querySelector(".author").innerHTML = photo.user_name;
    photoNode.querySelector(".desc").innerHTML = photo.description;
    photoNode.querySelector(".like").innerHTML = photo.likes;
    photoNode.querySelector(".like").addEventListener(
      "click",
      function () {
        toggleLike(photo.idx)
      }
    )
    photoNode.querySelector(".photo").style.backgroundImage = "url('" + photo.url + "')";
    if (my_info.like.indexOf(photo.idx) > -1) {
      photoNode.querySelector(".like").classList.add("on");
    }
    if (my_info.follow.indexOf(photo.user_id) > -1) {
      let followSpan = document.createElement("span");
      followSpan.innerHTML = "  following"
      photoNode.querySelector(".author").append(followSpan);
    }
    photoNode.querySelector(".author").addEventListener(
      "click",
      function () {
        toggleFollow(photo.user_id)
      }
    )

  photoNode.querySelector(".photo").addEventListener('click', function (){
      selectedPhoto = photo;
      document.querySelector("main").className ='detail';

      let detailSection = document.querySelector("#detail");
      detailSection.querySelector(".photo").style.backgroundImage 
      = "url('" + photo.url + "')";
      detailSection.querySelector(".author").innerHTML = photo.user_name;
      detailSection.querySelector(".desc").innerHTML = photo.description;
      loadComments();
    })

    gallery.appendChild(photoNode);
  })
}

function toggleFollow(user_id) {
  if (my_info.follow.indexOf(user_id) === -1) {
    my_info.follow.push(user_id);
  } else {
    my_info.follow = my_info.follow.filter(
      function (it) {
        return it !== user_id;
      }
    );
  }
  db.collection("my_info").doc(my_info.docId).update({
    follow: my_info.follow
  }).then(function () {
    loadPhotos(); //서버 업로드 구문
  });
}



// 사진의 좋아요 토글
function toggleLike(idx) {
  if (my_info.like.indexOf(idx) === -1) {
    my_info.like.push(idx);
    for (var i = 0; i < photos.length; i++) {
      if (photos[i].idx === idx) {
        photos[i].likes++;
        toggleLikeOnDB(photos[i]);
        break;
      }
    } // 좋넣
  } else {
    my_info.like = my_info.like.filter(
      function (it) {
        return it !== idx;
      }
    );
    for (var i = 0; i < photos.length; i++) {
      if (photos[i].idx === idx) {
        photos[i].likes--;
        toggleLikeOnDB(photos[i]);
        break;
      }
    } //좋뺌
  }
  //showPhotos();
}

function toggleLikeOnDB(photo) {
  db.collection("my_info").doc(my_info.docId).update({
    like: my_info.like
  }).then(function () {
    db.collection("photos").doc(String(photo.idx)).update({
      likes: photo.likes
    }).then(function () {
      loadPhotos(); //async
    });
  });
}
//then - 어떤 영역 서버 보낸 다음, 실행되는 부분이 then 안에 있음



// 사진올리기의 사진설명 길이 표시
function setDescLength() {
  document.querySelector(".descLength").innerHTML =
    document.querySelector("input.description").value.length + "/20";
}

function updateMyInfo() {
  my_info.introduction = document.querySelector("#ip-intro").value;
  my_info.as = document.querySelector("#myinfo input[type=radio]:checked").value;
  var interests = [];
  document.querySelectorAll("#myinfo input[type=checkbox]:checked").forEach(function (checked) {
    interests.push(checked.value);
  });
  my_info.interest = interests;
  setEditMyInfo(false);
  updateMyInfoOnDB();
}

function showMyInfo() {
  document.querySelector("#myInfoId").innerHTML = my_info.id;
  document.querySelector("#myInfoUserName").innerHTML = my_info.user_name;
  document.querySelector("#sp-intro").innerHTML = my_info.introduction;
  document.querySelector("#ip-intro").value = my_info.introduction;
  //input이기때문에 value로 지정
  document.querySelector("#myinfo input[type=radio][value=" + my_info.as + "]").checked = true;
  //radio타입 input 설정
  document.querySelectorAll("#myinfo input[type=checkbox]").forEach(function (checkbox) {
    checkbox.checked = false;
  });
  my_info.interest.forEach(function (interest) {
    document.querySelector("#myinfo input[type=checkbox][value=" + interest + "]").checked = true;
  });
  //forEach는 array 자료구조에서만 사용할 수 있는 함수!!!!!!!!!! 제발!!!
}

function setEditMyInfo(on) {
  document.querySelector("#myinfo > div").className = on ? "edit" : "non-edit";
  document.querySelectorAll("#myinfo input").forEach(function (input) {
    input.disabled = !on;
  })
  // 취소했을 때 원상복구하기 위해
  showMyInfo();
}

// 화면 처음 읽으면 실행되는 함수
function init() {
  //showPhotos();
  //showMyInfo();
  loadMyInfo();
  loadPhotos();
}

function loadMyInfo() {
  db.collection("my_info").get().then(function (querySnapshot) {
    querySnapshot.forEach(function (doc) {
      my_info = doc.data();
      //받아온 document의 id
      my_info.docId = doc.id;

      showMyInfo();
    })
  });
}


function updateMyInfoOnDB() {
  db.collection("my_info").doc(my_info.docId).update({
    introduction: my_info.introduction,
    as: my_info.as,
    interest: my_info.interest //key:value;
  }).then(function () {
    loadMyInfo();
  })
}

function uploadFile() {
  console.log("runing");
  let file = document.querySelector("input[type=file]").files[0];
  console.log(file);
  let ref = storage.ref().child(file.name);
  ref.put(file).then(function (snapshot) {

    snapshot.ref.getDownloadURL().then(function (url) {
      uploadPhotoInfo(url);
    });

  });
}

//사진 업로드 하기
function uploadPhotoInfo(url) { //uploadFile에서 받은거 매개변수로 받아서 돌린다!
  let photoInfo = {
    idx: Date.now(),
    url: url,
    user_id: my_info.id,
    user_name: my_info.user_name,
    description: document.querySelector("input.description").value,
    likes: Math.round(Math.random() * 10)
  }
  db.collection("photos").doc(String(photoInfo.idx)).set(photoInfo)
    .then(function () {
      console.log("성공");
      setMenu('gallery');
      loadPhotos();
    })
    .catch(function (error) {
      console.error("에러", error);
    });
}

function loadPhotos() { //기존 내역 지우고 새로 받아오는 함수
  db.collection("photos").where(
    getFilterParameters[filterName]()[0],
    getFilterParameters[filterName]()[1],
    getFilterParameters[filterName]()[2]
  ).get().then(function (querySnapshot) {
    let photosArray = []
    querySnapshot.forEach(function (doc) {
      photosArray.push(doc.data())
    })
    photos = photosArray;
    showPhotos();
  });
}

let filterName = 'all';

let getFilterParameters = {
  all: function () {
    return ['idx', '>', 0]
  },
  mine: function () {
    return ['user_id', '==', my_info.id]
  },
  like: function () {
    return ['idx', 'in', my_info.like]
  },
  follow: function () {
    return ['user_id', 'in', my_info.follow]
  }
}

let selectedPhoto;

function keyEnter(){
  if(window.event.keyCode ==13){
    uploadComment();
  }
}

function uploadComment () {
  let comment = {
    idx: Date.now(),
    photo_idx: selectedPhoto.idx,
    user_id: my_info.id,
    user_name: my_info.user_name,
    comment: document.querySelector("#comment-input").value
  }
  console.log(comment);

  db.collection("comments").doc(String(comment.idx)).set(comment)
  .then(function () {
    console.log("성공!");
    document.querySelector("#comment-input").value = '';
    loadComments();
  })
  .catch(function (error) {
    console.error("에러!", error);
  });
}

function loadComments () {
  document.querySelector("#comments").innerHTML ='';
  db.collection("comments").where("photo_idx", "==", selectedPhoto.idx).get().then(function (querySnapshot) {
    let comments = [];
    querySnapshot.forEach(function (doc) {
      comments.push(doc.data());
    })
    comments.sort(function (a, b) {
      return a.idx > b.idx ? 1 : -1; 
    })
    comments.forEach(function (comment) {
      let commentArticle = document.createElement("article");
      let commentInfoDiv = document.createElement("div");

      commentInfoDiv.className = "comment-info"
      commentInfoDiv.innerHTML = comment.user_name;

      var dateSpan = document.createElement("span");
      dateSpan.innerHTML = new Date(comment.idx);

      commentInfoDiv.appendChild(dateSpan);

      let commentContentDiv = document.createElement("div");
      commentContentDiv.innerHTML = comment.comment;

      commentArticle.append(commentInfoDiv);
      commentArticle.append(commentContentDiv);

      document.querySelector("#comments").append(commentArticle);
    });
  })
}