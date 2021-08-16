/**
 * 引数なし、クラスを返す。
 * メソッドはsend
 * 
 * @param {Object} e - Json形式のデータ
 * @return {Class}} result クラスが戻る。
 */
function line(){
  var line = new line_link()
  return line
}

class line_link{
  constructor(){
  }

  send(ACCESS_TOKEN){
    var re = new send(ACCESS_TOKEN);
    return re;
  }
}

class send{
  constructor(ACCESS_TOKEN){
    this.headers = {
      "Content-Type" : "application/json; charset=UTF-8",
      Authorization: 'Bearer ' + ACCESS_TOKEN,
    };
  }

  image(new_preview,new_original){
    return new image(this.headers,new_preview,new_original)
  }

  text(text_t){
    return new text(this.headers,text_t)
  }
}

class image{
  constructor(headers,preview,original,message = [],mess_num = 0){
    this.headers = headers
    this.mess_num = mess_num
    var preview_imageUrl = "https://drive.google.com/uc?id=" + preview;
    var original_imageUrl = "https://drive.google.com/uc?id=" + original;
    var tmp_image = {
      'type' : 'image',
      'originalContentUrl' : original_imageUrl,
      'previewImageUrl' : preview_imageUrl
    }

    if(this.mess_num < 5){
      message.push(tmp_image)
    }
    
    this.message = message
  }

  image(new_preview,new_original){
    return new image(this.headers,new_preview,new_original,this.message,this.mess_num + 1)
  }

  text(text_t){
    return new text(this.headers,text_t,this.message,this.mess_num + 1)
  }

  reply(replyToken){
    var reply_url = 'https://api.line.me/v2/bot/message/reply'; // 応答メッセージ用のAPI URL
    var postData = {
      'replyToken': replyToken,
      'messages': this.message,
    }
    UrlFetchApp.fetch(reply_url, {
      'headers': this.headers,
      'method': 'post',
      'payload': JSON.stringify(postData),
    });
  }

  post(send_id){
    var push_url = 'https://api.line.me/v2/bot/message/push'; // 送信メッセージ用のAPI URL
    var postData = {
      'to': send_id,
      'messages': this.message,
    }
    UrlFetchApp.fetch(push_url, {
      'headers': this.headers,
      'method': 'post',
      'payload': JSON.stringify(postData),
    });
  }
}

class text{
  constructor(headers,text,message = [],mess_num = 0){
    this.headers = headers
    this.mess_num = mess_num
    var tmp_text = {
      'type': 'text',
      'text': text
    }
    if(this.mess_num < 5){
      message.push(tmp_text)
    }
    this.message = message
    
  }

  image(new_preview,new_original){
    return new image(this.headers,new_preview,new_original,this.message,this.mess_num + 1)
  }

  text(text_t){
    return new text(this.headers,text_t,this.message,this.mess_num + 1)
  }

  reply(replyToken){
    var reply_url = 'https://api.line.me/v2/bot/message/reply'; // 応答メッセージ用のAPI URL
    var postData = {
      'replyToken': replyToken,
      'messages': this.message,
    }
    UrlFetchApp.fetch(reply_url, {
      'headers': this.headers,
      'method': 'post',
      'payload': JSON.stringify(postData),
    });
  }

  post(send_id){
    var push_url = 'https://api.line.me/v2/bot/message/push'; // 送信メッセージ用のAPI URL
    var postData = {
      'to': send_id,
      'messages': this.message,
    }
    UrlFetchApp.fetch(push_url, {
      'headers': this.headers,
      'method': 'post',
      'payload': JSON.stringify(postData),
    });
  }
}

function get_foler(GOOGLE_DRIVE_FOLDER_ID){
  var get_foler = new get_foler_link(GOOGLE_DRIVE_FOLDER_ID)
  return get_foler
}

class get_foler_link{
  constructor(GOOGLE_DRIVE_FOLDER_ID){
    //★★フォルダーID★★
    this.folder_id = GOOGLE_DRIVE_FOLDER_ID;
  }

  allfiles(){
    var re = new allfiles(this.folder_id);
    return re;
  }

  getsaveImage(e,ACCESS_TOKEN,filename){
    var json = JSON.parse(e.postData.contents);
    var messageType = json.events[0].message.type; //メッセージタイプ
    if(messageType !== "image"){
      return null
    }

    //受信したメッセージ情報を変数に格納する
    var messageId = json.events[0].message.id; //メッセージID
    var end_url = "https://api-data.line.me/v2/bot/message/" + messageId + "/content/";
    var headers = {
      "Content-Type": "application/json; charset=UTF-8",
      "Authorization": "Bearer " + ACCESS_TOKEN
    };
    var options = {
      "method" : "get",
      "headers" : headers,
    };
    //Blob形式で画像を取得し、ファイル名を設定する
    //ファイル名: LINE画像_YYYYMMDD_HHmmss.png
    var imageBlob = UrlFetchApp.fetch(end_url, options).getBlob().getAs("image/png").setName(filename);
    var folder = DriveApp.getFolderById(this.folder_id);
    var file = folder.createFile(imageBlob);
    return file;
  }
}

function allfiles(GOOGLE_DRIVE_FOLDER_ID){
  // 指定フォルダ内のファイルを一括取得(FileIteratorオブジェクト)
  this.files = DriveApp.getFolderById(GOOGLE_DRIVE_FOLDER_ID).getFiles();
  this.serch_name = function(text,extension = 'JPG',opt = null){
    var front_text = "^"
    var end_text = "$"
    var retext = null;
    if(!opt){
      front_text = "";
      end_text = "";
    }
    while (this.files.hasNext()) {
      var file = this.files.next();
      var fileid = file.getId();
      var filename = file.getName();

      // ★POINT★正規表現で絞り込む
      var strCombRegex = front_text + text + "\." + extension + end_text;
      // 正規表現に組み合わせたい文字列
      var regexp = new RegExp(strCombRegex,"i");
      // 正規表現オブジェクト ここでは正規表現も文字列で記載する
      if (filename.match(regexp)) {
        retext = fileid;
      }
    }
    return retext;
  }
}

function workspace(){
  var message = [];
  Logger.log(typeof message);
  Logger.log(typeof message);
  Logger.log(message.length);
  Logger.log(typeof "message");
}