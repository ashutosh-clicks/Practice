#include <iostream>
using namespace std;

class Node{
    public:
    int data;
    Node* next;

    Node(){
        data = 0;
        next = NULL;
    }

    Node(int data){
        this->data = data;
        next = NULL;
    }

};

Node* insertBegin(Node* head, int data){
    Node* newNode = new Node(data);
    if(head == NULL){
        return newNode;
    }
    else{
        newNode->next = head;
        return newNode;
    }
}

Node* insertEnd(Node* head, int data){
    Node* newNode = new Node(data);
    Node *temp = head;
    if(head == NULL){
        return newNode;
    }
    else{
        while(temp->next!=NULL){
            temp = temp->next;
        }
        temp->next = newNode;
        return head;
    }
}

Node* deleteEnd(Node* head){
    Node* temp = head;
    while(temp->next->next!=NULL){
        temp = temp->next;
    }
    delete temp->next;
    temp->next = NULL;
    return head;
}

Node* insertBefore(Node* head, int nodeValue, int data){
    Node* temp = head;
    Node* newNode = new Node(data);
    if(head->data == nodeValue){
        insertBegin(head,data);
    }
    else{

        while(temp->next->data != nodeValue&& temp ->next !=NULL){
            temp = temp->next;
        }
        newNode->next = temp->next;
        temp->next = newNode;
        return head;
    }

}

Node* insertAfter(Node* head,int nodeValue,int data){
    Node* newNode = new Node(data);
    Node* temp = head;
    if(head->data == nodeValue){
        temp = head->next;
        head->next = newNode;
        newNode->next = temp;
        return head;
    }
    else{
        while(temp->next != NULL && temp->next->data != nodeValue){
            temp = temp->next;
        }
        newNode->next = temp->next->next;
        temp->next = newNode;
        return head;
    }
}

Node* deleteBefore(Node* head, int nodeValue){
    Node* temp = head;
    if(head->data == nodeValue){
        cout<<"Not Possible";
        return head;
    }
    else if(head->next->data == nodeValue){
        head = head->next;
        return head;
    }
    else{
        while(temp->next->next->data != nodeValue and temp->next->next!=NULL){
            temp = temp->next;
        }
        temp->next = temp->next->next;
        return head;
    }
}

Node* deleteAfter(Node* head, int nodeValue){
    Node* temp = head;
    while(temp!=NULL && temp->data != nodeValue){
        temp = temp->next;
    }
    temp->next = temp->next->next;
    return head;
}

Node* reverseList(Node* head){
    Node* temp = head;
    Node *next;
    Node* prev = NULL;

    while(temp!=NULL){
        next = temp->next;
        temp->next = prev;
        prev = temp;
        temp = next;
    }
    return prev;
}

void printList(Node* head){
    Node* temp = head;
    while(temp!=NULL){
        cout<<temp->data<<"->";
        temp = temp->next;
    }
    cout<<"NULL";
}

int main(){
    Node* n1 = new Node(10);
    Node* n2 = new Node(20);
    Node* n3 = new Node(30);
    Node* head = n1;
    n1->next = n2;
    n2->next = n3;
    head = insertBegin(head,0);
    head = insertEnd(head,40);
    head = deleteEnd(head);
    head = insertBefore(head,30,25);
    head = insertBefore(head,20,15);
    head = insertAfter(head,0,5);
    head = deleteBefore(head,20);
    head = deleteAfter(head,5);
    head = reverseList(head);
    printList(head);

}