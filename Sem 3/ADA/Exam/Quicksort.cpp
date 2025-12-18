#include <iostream>
using namespace std;

int partition(int arr[],int low, int high){
    int pivot = arr[low];
    int i = low+1;
    int j = high;

    while(i <= j){
        while(i <= high && arr[i]<= pivot){
            i++;
        }
        while(arr[j]>pivot){
            j--;
        }
        if(i<j){
            swap(arr[i],arr[j]);
        }
    }
    swap(arr[low],arr[j]);
    return j;

}

void quickSort(int arr[],int low,int high){
    if(low<high){
        int p = partition(arr,low,high);
        quickSort(arr,low,p-1);
        quickSort(arr,p+1,high);

    }
}