#include <iostream>
using namespace std;

int arr[100] = {1,2,4,5};
int ele = 4;
int len = sizeof(arr)/sizeof(arr[0]);


void print(int *arr){
    for (int i =0; i<ele;i++){
        cout<<arr[i]<<" ";
    }
    cout<<endl;
}

int insertAtBegin(int *arr, int value){
    if(ele == 0){
        arr[0] = value;
        ele++;
        return ele;
    }
    for(int i =ele-1; i>=0;i--){
        arr[i+1] = arr[i];
    }
    arr[0] = value;
    ele++;
    return ele;
}

int insertEnd(int *arr, int value){
    arr[ele] = value;
    ele++;
    return ele;
}

int insertAtIndex(int *arr, int index, int value){
    if(index>ele){
        cout<<"Out of bounds";
        return ele;
    }
    for(int i = ele; i>=index;i--){
        arr[i+1] = arr[i];
    }
    arr[index] = value;
    ele++;
    return ele;
}

int deleteAtBegin(int *arr){
    for(int i = 0; i<ele;i++){
        arr[i] = arr[i+1];
    }
    ele--;
    return ele;
}

int deleteAtEnd(int *arr){
    ele--;
    return ele;
}

int deleteAtIndex(int *arr, int index){
    if(index>ele){
        cout<<"Out of bounds";
        return ele;
    }
    else{
        for(int i = index;i<ele;i++){
            arr[i] = arr[i+1];
        }
        ele--;
        return ele;
    }
}

int main(){
    ele = insertAtBegin(arr,0);
    ele = insertEnd(arr,6);
    ele = insertAtIndex(arr,3,3);
    // ele = insertAtIndex(arr,9,7);
    ele = deleteAtBegin(arr);
    ele = deleteAtEnd(arr);
    // ele = deleteAtEnd(arr);
    ele = deleteAtIndex(arr,2);
    print(arr);

}