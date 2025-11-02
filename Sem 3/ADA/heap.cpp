#include <iostream>

using namespace std;

class MinHeap{
    public:
    int heap[100];
    int size;

    MinHeap(){
        size = 0;
    }

    int parent(int i){ return (i-1)/2;}
    int left(int i){return (2*i)+1;}
    int right(int i){ return (2*i)+2;}

    void insert(int value){

        if(size == 100){
            cout<<"Heap is full";
            return;
        }
        else{
            heap[size] = value;
            int i = size;
            size++;

            while (i != 0 && heap[parent(i)] > heap[i]) {
                swap(heap[i], heap[parent(i)]);
                i = parent(i);
            }
        }
    }

    void display() {
        for (int i = 0; i < size; i++)
            cout << heap[i] << " ";
        cout << endl;
    }

};


int main(){
    MinHeap h;
    h.insert(20);
    h.insert(5);
    h.insert(30);
    h.insert(2);


    cout << "Heap: ";
    h.display();


    return 0;
}