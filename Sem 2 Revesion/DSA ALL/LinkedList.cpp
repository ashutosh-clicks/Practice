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
        this->next = NULL;
    }


};

void printList(Node* head){
    Node* temp = head;
    while(temp!=NULL){
        cout<<temp->data<<"->";
        temp = temp->next;
    }
    cout<<"NULL";
}

Node* insertHead(Node* head,int value){
    Node* newNode = new Node(value);
    if(head == NULL){
        head = newNode;
        return head;
    }
    else{
        newNode->next = head;
        head = newNode;
        return newNode;
    }
}

Node* insertEnd(Node* head, int value){
    Node* newNode = new Node(value);
    Node* temp = head;
    if(head == NULL){
        head = newNode;
        return newNode;
    }
    else{
        while(temp->next != NULL){
            temp = temp->next;
        }
        temp->next = newNode;
        return head;
    }
}

Node* deleteHead(Node* head){
    if(head == NULL){
        return head;
    }
    else{
        Node* temp = head;
        head = head->next;
        delete temp;
        return head;
    }
}

Node* deleteEnd(Node* head){
    if(head == NULL){
        return head;
    }
    else{
        Node* temp = head;
        while(temp->next->next !=NULL){
            temp = temp->next;
        }
        delete temp->next;
        temp->next = NULL;
        return head;
    }
}

Node* insertAtPosition(Node* head,int value,int pos){
    Node* temp = head;
    Node* newNode = new Node(value);

    if(pos == 1){
        insertHead(head,value);
    }
    else if(pos < 0){
        cout<<"Out of bounds";
        return head;
    }
    else{
        for(int i=1;i<pos-1;i++){
            temp=temp->next;
        }
        newNode->next = temp->next;
        temp->next = newNode;
        return head;
    }
}

Node* deleteAtPosition(Node* head,int pos){
    Node* temp = head;
    if(pos == 1){
        deleteHead(head);
    }
    else{
        for(int i =1;i<pos-1;i++){
            temp = temp->next;
        }
        Node* del = temp->next;
        temp->next = temp->next->next;
        delete del;
        return head;
    }
}

int main(){
    Node*n1 = new Node(10);
    Node*n2 = new Node(20);
    Node*n3 = new Node(40);
    Node*n4 = new Node(50);

    Node* head = n1;
    n1->next = n2;
    n2->next = n3;
    n3->next = n4;

    head = insertHead(head,0);
    head = insertEnd(head,60);
    head = deleteHead(head);
    head = deleteEnd(head);
    head = insertAtPosition(head,25,3);
    head = deleteAtPosition(head,3);
    printList(head);
}