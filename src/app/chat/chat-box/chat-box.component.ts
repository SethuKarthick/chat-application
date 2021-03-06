import { Component, OnInit, ViewContainerRef, ViewChild, ElementRef } from '@angular/core';

import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AppService } from './../../app.service';
import { SocketService } from './../../socket.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

//import { FirstCharComponent } from '../../shared/first-char/first-char.component';
//import { ChatMessage } from './chat';
//import { CheckUser } from './../../CheckUser';


@Component({
  selector: 'app-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.css'],
  providers : [SocketService]
})
export class ChatBoxComponent implements OnInit {
  @ViewChild('scrollMe', { read: ElementRef, static:true }) 
  
  public scrollMe: ElementRef;

  public authToken : any;
  public userInfo : any;
  public receiverId : any;
  public receiverName : any;
  public userList : any =  [];
  public disconnectedSocket : boolean;

  public scrollToChatTop:boolean= false;


  public previousChatList: any = [];
  public messageText: any; 
  public messageList = []; // stores the current message list display in chat box
  public pageValue: number = 0;
  public loadingPreviousChat: boolean = false;

  constructor(
    public appService: AppService,
    public socketService : SocketService,
    public route: Router,
    public toastr: ToastrService,
    vcr: ViewContainerRef
  ) { 
    this.receiverId  = Cookie.get('receiverId');
    this.receiverName = Cookie.get('receiverName');
  }

  ngOnInit() {
    this.authToken = Cookie.get("authtoken");
    this.userInfo = this.appService.getUserInfoFromLocalStorage();
    this.checkStatus();
    this.verifyUserConfirmation();
    //this.getOnlineUserList();
    this.getMessageFromAUser();
  } 

  public checkStatus: any = () => {
    if(Cookie.get('authtoken') === undefined || Cookie.get('authtoken') === '' || Cookie.get('authtoken') === null ){
      this.route.navigate(['/']);
      return false;
    } else {
      return true;
    }
  }  // end Check Status

  public verifyUserConfirmation : any = () => {
    this.socketService.verifyUser().subscribe((data) => {
      this.disconnectedSocket = false;

      this.socketService.setUSer(this.authToken);
      this.getOnlineUserList();
    });
  }

  public getOnlineUserList: any=() => {
    this.socketService.onlineUserList().subscribe((userList) => {
      this.userList = [];
      for (let x in userList) {
        let temp = { 'userId': x, 'name': userList[x], 'unread': 0 , 'chatting': false};
        this.userList.push(temp);

      }
      console.log(this.userList);
    });
  } // end of OnlineUser List

  public sendMessageUsingKeypress: any = (event: any) => {

    if (event.keyCode === 13) { // 13 is keycode of enter.

      this.sendMessage();

    }

  } // End Send MessageUsing Keypress

  public sendMessage: any = () => {

    if(this.messageText){

      let chatMsgObject = {
        senderName: this.userInfo.firstName + " " + this.userInfo.lastName,
        senderId: this.userInfo.userId,
        receiverName: Cookie.get('receiverName'),
        receiverId: Cookie.get('receiverId'),
        message: this.messageText,
        createdOn: new Date()
      } // end chatMsgObject
      console.log(chatMsgObject);
      this.socketService.SendChatMessage(chatMsgObject)
      this.pushToChatWindow(chatMsgObject)
      

    }
    else{
      this.toastr.warning('text message can not be empty')

    }

  }// end of sendMessage

  public pushToChatWindow : any =(data)=>{

    this.messageText="";
    this.messageList.push(data);
    this.scrollToChatTop = false;


  }// end of push to chat window

  public getMessageFromAUser :any =()=>{

    this.socketService.chatByUserId(this.userInfo.userId)
    .subscribe((data)=>{
     

      (this.receiverId==data.senderId)?this.messageList.push(data):'';

      this.toastr.success(`${data.senderName} says : ${data.message}`)

      this.scrollToChatTop=false;

    });//end subscribe

  }  //end  getMessageFromAUser

  public userSelectedToChat: any = (id, name) => {

    console.log("setting user as active") 

    // setting that user to chatting true   
    this.userList.map((user)=>{
        if(user.userId==id){
          user.chatting=true;
        }
        else{
          user.chatting = false;
        }
    })

    Cookie.set('receiverId', id);

    Cookie.set('receiverName', name);


    this.receiverName = name;

    this.receiverId = id;

    this.messageList = [];

    this.pageValue = 0;

    let chatDetails = {
      userId: this.userInfo.userId,
      senderId: id
    }


    this.socketService.markChatAsSeen(chatDetails);

    this.getPreviousChatWithAUser();

  } // userSelectedToChat

  public getPreviousChatWithAUser :any = ()=>{
    let previousData = (this.messageList.length > 0 ? this.messageList.slice() : []);
    
    this.socketService.getChat(this.userInfo.userId, this.receiverId, this.pageValue * 10)
    .subscribe((apiResponse) => {

      console.log(apiResponse);

      if (apiResponse.status == 200) {

        this.messageList = apiResponse.data.concat(previousData);
        console.log("messagelist")
        console.log(this.messageList)

      } else {

        this.messageList = previousData;
        this.toastr.warning('No Messages available')

       

      }

      this.loadingPreviousChat = false;

    }, (err) => {

      this.toastr.error('some error occured')


    });

  } // getPreviousChatWithAUser

  public loadEarlierPageOfChat: any = () => {

    this.loadingPreviousChat = true;

    this.pageValue++;
    this.scrollToChatTop = true;

    this.getPreviousChatWithAUser() 

  }

  public logout: any = () => {

    this.appService.logout()
      .subscribe((apiResponse) => {

        if (apiResponse.status === 200) {
          console.log("logout called")
          Cookie.delete('authtoken');

          Cookie.delete('receiverId');

          Cookie.delete('receiverName');

          this.socketService.exitSocket()

          this.route.navigate(['/']);

        } else {
          this.toastr.error(apiResponse.message)

        } // end condition

      }, (err) => {
        this.toastr.error('some error occured')


      });

  }

  public showUserName = (name:string) => {
    this.toastr.success("you are chatting with " +name);
  }
}
