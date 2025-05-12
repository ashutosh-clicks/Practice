#include <iostream>
using namespace std;

class Node{
    public:
    int data;
    Node* rear;
    Node* front;
    
    Node(int data){
        rear = NULL;
        front = NULL;
        this->data = data;
    }

    bool isEmpty(){
        if(front == NULL){
            return true;
        }
        return false;
    }

    void enqueue(int value){
        
    }
};