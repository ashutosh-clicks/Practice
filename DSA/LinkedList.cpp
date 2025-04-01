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

    Node(int a){
        data = a;
        next = NULL;
    }

};

Node* insertAtBeginning(Node* head, int newData){
    Node* newNode = new Node();
    newNode->next = head;
    return newNode;
}

Node* insertAtEnd(Node* head, int newData){
    Node* newNode = new Node(newData);
    Node* temp = head;
    while(temp->next!=NULL){
        temp = temp->next;
    }
    temp->next = newNode;
    return head;
}

Node* deleteFromBeginning(Node* head){
    if(head == NULL){
        return head;
    }
    else{
        Node* temp = head;
        head = head->next;
        delete temp;
    }
    return head;
}

Node* deleteFromEnd(Node* head){
    Node* temp = head;
    Node* tempting  = temp->next;
    while(tempting->next!=NULL){
        tempting = tempting->next;
        temp = temp->next;
    }
    delete temp->next;
    temp->next = NULL;
    return head;
}

void printListF(Node* head){
    Node *temp = head;
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
    
    head = insertAtBeginning(head,0);
    head = insertAtEnd(head, 40);
    head = insertAtEnd(head,50);
    head = deleteFromBeginning(head);
    head = deleteFromEnd(head);
    printListF(head);

    return 0;
}