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

    void heapify(int i){
        int l = left(i);
        int r = right(i);
        int largest  = i;

        if (l < size && heap[l] > heap[largest])
            largest = l;

        if (r < size && heap[r] > heap[largest])
            largest = r;

        if (largest != i) {
            swap(heap[i], heap[largest]);
            heapify(i);
        }
    }




    int extractMin() {
        if (size <= 0)
            return -1;

        int root = heap[0];
        heap[0] = heap[size - 1];
        size--;

        heapify(0);
        return root;
    }

};

class MaxHeap{
    public:
    int heap[100];
    int size;

    int parent(int i){return (i-1)/2;}
    int left(int i){return 2*i+1;}

    int right(int i){return 2*i+2;}

    MaxHeap(){
        size = 0;
    }

    void insert(int value){
        if(size == 100){
            cout<<"Heap is full";
            return;
        }
        else{
            heap[size] = value;
            int i = size;
            size++;

            while (i != 0 && heap[parent(i)] < heap[i]) {
                swap(heap[i], heap[parent(i)]);
                i = parent(i);
            }

        }
    }

    void display(){
        for(int i = 0; i<size;i++){
            cout<<heap[i]<<" ";

        }
    }

    void heapify(int i){
        int l = left(i);
        int r = right(i);
        int largest = i;

        if(l<size && heap[l]>largest){
            largest = l;
        }
        if(r<size && heap[r]>largest){
            largest = r;
        }
        if(largest != i){
            swap(heap[i],heap[largest]);
            heapify(largest);
        }

    }
    
    void heapSort(){
        int ogsize = size;

        for(int i = size/2-1;i>=0;i--){
            heapify(i);
        }

        for(int i = size-1;i>=1;i--){
            swap(heap[0],heap[i]);
            size--;
            heapify(0);
        }
        size = ogsize;
    }
    

    int extractMax() {
        if (size <= 0)
            return -1;

        int root = heap[0];
        heap[0] = heap[size - 1];
        size--;

        heapify(0);
        return root;
    }
};


int main(){
    MaxHeap h;
    h.insert(20);
    h.insert(5);
    h.insert(30);
    h.insert(2);
    h.insert(50);


    cout << "Heap: ";
    h.display();

    // cout<<h.extractMax();
    h.heapSort();




    return 0;
}