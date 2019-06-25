import { Injectable } from '@angular/core';

import *as io from 'socket.io';

import { Observable,throwError } from 'rxjs';
import { Cookie } from 'ng2-cookies/ng2-cookies';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/toPromise';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {HttpErrorResponse, HttpParams} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private url = "https://chatapi.edwisor.com";
  private socket ; 

  constructor( public http: HttpClient) {
    this.socket=io(this.url);
   }

   public verifyUser = () =>{
     return Observable.create((Observer) => {
       this.socket.on('verifyUser', (data)=>{
         Observer.next(data);

       }); // end Socket
     } ); // end Observable  
   }// end verifyUSer

   public onlineUserList = () => {
     return Observable.create((Observer) => {
       this.socket.on("online-user-list", (userlist) => {
         Observer.next(userlist);
       }); // end socket


     }); // end Observable 
   } // end onlineUserList 
   
   public disconnectedSocket =() => {
     return Observable.create((Observer) => {
       this.socket.on('disconnect', () => {
         Observer.next();
       }) ; // end Socket
     }) ; // end Observable 
   } // end DisconnectSocket

   public setUSer = (authToken) => {
     this.socket.emit("set-user", authToken);
   } // end setUser

   public markChatAsSeen = (userDetails) => {

    this.socket.emit('mark-chat-as-seen', userDetails);

   } // end markChatAsSeen

   public getChat(senderId, receiverId, skip): Observable<any> {

    return this.http.get(`${this.url}/api/v1/chat/get/for/user?senderId=${senderId}&receiverId=${receiverId}&skip=${skip}&authToken=${Cookie.get('authtoken')}`)
      .do(data => console.log('Data Received'))
      .catch(this.handleError);

   }  // getChat

   public chatByUserId = (userId) => {

    return Observable.create((observer) => {
      
      this.socket.on(userId, (data) => {

        observer.next(data);

      }); // end Socket

    }); // end Observable

  }

   public SendChatMessage = (chatMsgObject) => {

    this.socket.emit('chat-msg', chatMsgObject);

  } // End of Send Chat Message

  public exitSocket = () =>{


    this.socket.disconnect();


  }// end exit socket

   private handleError(err: HttpErrorResponse) {
     let errorMessage = '';
     if (err.error instanceof Error) {
       errorMessage = `An error Occured : ${err.error.message}`; 
     } else {
       errorMessage =  `Server returned code : ${err.status}, error message is: ${err.message}`;
     } // end if 
     console.error(errorMessage);
     return Observable.throw(errorMessage);
   } // error Handle
}
