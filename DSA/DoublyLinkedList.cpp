#include <iostream>
using namespace std;

class Node{
    public:
    Node* next,*prev;
    int data;

    Node(){
        data = 0;
        next = NULL;
        prev = NULL;
    }
    Node(int data){
        this->data = data;
        next = NULL;
        prev = NULL;
    }


};

Node* insertBegin(Node* head,int data){
    Node* newNode = new Node(data);
    if(head == NULL){
        return newNode;
    }
    else{
        newNode->next = head;
        head->prev = newNode;
        return newNode;
    }

}

Node* insertEnd(Node* head, Node* tail,int data){
    Node* newNode = new Node(data);
    if(head == NULL){
        return newNode;
    }
    else{
        tail->next = newNode;
        newNode->prev = tail;
        return head;
    }
}
Node* insertBefore(Node* head, int nodeData, int data){
    Node* temp = head;
    Node* newNode = new Node(data);
    if(head->data == nodeData){
        insertBegin(head,data);
    }
    else{
        while(temp->next->data != nodeData && temp->next != NULL){
            temp = temp->next;
        }
        
        newNode->next = temp->next;
        temp->next = newNode;
        return head;
    }
}

Node* insertAfter(Node* head,int nodeData,int data){
    Node* temp = head;
    Node* newNode = new Node(data);
    if(head == NULL){
        insertBegin(head,data);
    }
    else{
        while(temp->data!=nodeData && temp!=NULL){
            temp = temp->next;
        }
        newNode->next = temp->next;
        temp->next = newNode;
        return head;
    }
}

Node* deleteBefore(Node* head, int nodeData){
    Node* temp = head;
    Node* prev = NULL;

    while(temp->next->next->data != nodeData && temp->next->next !=NULL){
        temp = temp->next;
    }
    prev = temp->next;
    temp->next = prev->next;
    delete prev;
    return head;
}

Node* deleteAfter(Node* head, int nodeData){
    Node* temp = head;
    Node* prev = NULL;
    while(temp->data!=nodeData and temp->next != NULL){
        temp = temp->next;
    }
    prev = temp->next;
    temp->next = prev->next;
    delete prev;
    return head;
}

/*Node* deleteBefore(Node* head, int nodeData){
    Node* temp = head;
    if(head->data == nodeData){
        cout<<"Not Possible";
        return head;
    }
    else{
        while(temp->next->next->data != nodeData && temp->next->next != NULL){
            temp = temp->next;
        }
        temp->next = temp->next->next;

        return head;
    }
}*/

/*Node* deleteAfter(Node* head,int nodeValue){
    Node *temp = head;
    while(temp->data != nodeValue && temp->next != NULL){
        temp = temp->next;
    }
    // delete temp->next;
    temp->next = temp->next->next;
    return head;
}*/
void printList(Node*head){
    Node* temp = head;
    while(temp!=NULL){
        cout<<temp->data<<"->";
        temp = temp->next;
    }
    cout<<"NULL";
}

int main(){
    Node*n1  = new Node(10);
    Node*n2 = new Node(20);
    Node*n3 = new Node(30);

    n1->next = n2;
    n2->next =n3;

    n3->prev = n2;
    n2->prev = n1;

    Node* head = n1;
    Node* tail = n3;

    head = insertBegin(head,0);
    head = insertEnd(head,tail,40);
    head = insertBefore(head,20,15);
    head = insertAfter(head,20,25);
    head = deleteBefore(head,20);
    head = deleteAfter(head,20);
    printList(head);

}