#include <iostream>
using namespace std;

class Node{
    public:
    int data;
    Node* next;
    
    Node(int data){
        
        next = NULL;
        this->data = data;
    }
};

class Queue{
    private:
    Node* rear;
    Node* front;
    
    public:

    Queue(){
        rear = front = NULL;
    }

    bool isEmpty(){
        if(front == NULL){
            return true;
        }
        return false;
    }

    void enqueue(int value){
        Node* newNode = new Node(value);
        if(isEmpty()){
            front = rear = newNode;
        }
        else{
            rear->next = newNode;
            rear = newNode;
        }
    }
    void print() 
		{
	        Node* temp = front;
	        while (temp != NULL) {
	            cout << temp->data << " ";
	            temp = temp->next;
	        }
	        cout << endl;
	    }

    void dequeue(){
        if(front == NULL){
            cout<<"LMAO XD DED";
            return ;
        }
        else{
            Node* temp = front;
            front = front->next;
            delete temp;
            return;
        }
    }
};

int main(){
    Queue q;

    q.enqueue(10);
    q.enqueue(20);
    q.enqueue(30);
    q.dequeue();
    q.print(); 
    // q.print(); 

    // cout << "Front element: " << q.peek() << endl; 

    return 0;
}