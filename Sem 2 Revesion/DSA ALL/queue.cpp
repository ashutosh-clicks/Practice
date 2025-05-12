#include <iostream>
using namespace std;

class queue{
    public:
    int front, rear, capacity;
    int *Queue;

    queue(int capacity){
        this->capacity = capacity;
        rear = front = -1;
        Queue = new int (capacity);
    }

    bool isEmpty(){
        if(front == -1){return true;}
        return false;
    }

    bool isFull(){
        if(rear == capacity-1){return true;}
        return false;
    }

    void enqueue(int data){
        if(isEmpty()){
            front++;
            rear++;
            Queue[front] = data;
        }
        else{
            rear++;
            Queue[rear] = data;
        }
        if(isFull()){return;}
    }

    void dequeue(){
        if(isEmpty()){
            return;
        }
        else{
            front++;
        }
        if(rear>front){
            front = rear = -1;
        }
    }

};