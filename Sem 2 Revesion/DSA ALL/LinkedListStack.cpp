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

class Stack{
    public:
    Node* top = NULL;

    bool isEmpty(){
        if(top == NULL){
            return true;
        }
        return false;
    }

    

    void print(){
        Node* temp = top;
        while(temp!=NULL){
            cout<<temp->data<<endl;
            temp = temp->next;
        }

    }

    void push(int x){
        Node* newNode = new Node(x);
        newNode->next = top;
        top = newNode;
        return ;
    }

    void pop(){
        Node* del = top;
        top = top->next;
        delete del;
        return;
    }

    void peek(){
        cout<<top->data;
    }
};

int main(){
    Stack *s1 = new Stack;
    s1->push(10);
    s1->push(20);
    s1->push(30);
    // s1->pop();
    s1->pop();
    s1->peek();
    // s1->push(10);
    // cout<<s1->size();
    s1->print();
}