#include <iostream>
using namespace std;

int main(){
    int n = 6;
    int arr[6] = {1,1,4,1,2,3};

    int i = 0;
    while(i< n){
        for(int j = 0; j<n;j++){
            if(arr[j]>=arr[j+1]){
                int temp = arr[j];
                arr[j] = arr[j+1];
                arr[j+1] = temp;
                
            }
        }
        i++;
    }

    i = 0;
    while(i<n){
        if(arr[i]==arr[i+1]){
            arr[i+1] = 0;
        }
        i++;
    }

    for(int k = 0;k<n;k++){
        cout<<arr[k]<<" ";
    }



    return 0;
}