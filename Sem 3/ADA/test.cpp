#include <iostream>
using namespace std;

class MaxHeap{
    public:
    int heap[100];
    int size;

    int parent(int i){return (i-1)/2;}
    int left(int i){return }

    MaxHeap(){
        size = 0;
    }


    void insert(int value){
        if(size == 100){
            cout<<"full";
            return ;
        }
        else{
            heap[size] = value;
            int i = size;
            size ++;

            while(i != 0 && )
        }
    }

};