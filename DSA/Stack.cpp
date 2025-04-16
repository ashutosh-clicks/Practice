#include <iostream>
using namespace std;


class Node{
    public:
    int data;
    Node* next;
    Node(int data){
        this->data = data;
        next = NULL;
    }
};

class Stack{
    
    public:
    Node* top = NULL;
    Stack(){
        top = NULL;
    }
    
    bool isEmpty(){
        if(top == NULL){
            return true;
        }
        return false;
    }

    void push(int data){
        Node* newNode = new Node(data);
        newNode->next = top;
        top = newNode;
    }

    void print() {
        Node* temp = top;
        while (temp != nullptr) {
            cout << temp->data<<endl;
            temp = temp->next;
        }
    }

    void pop(){
        if(isEmpty()){
            cout<<"Stack Underflow";
        }
        else{
            Node* temp = top;
            cout<<"Popped "<<temp->data<<endl;
            top = top->next;
            delete temp;
        }

    }

    void peek(){
        cout<<"Peek: "<<top->data<<endl;
    }
};

int main(){
    Node* top = NULL;
    Stack* s1 = new Stack();
    s1->push(10);
    s1->push(20);
    s1->push(30);
    s1->push(10);
    s1->pop();
    s1->peek();
    s1->print();

    return 0;
}