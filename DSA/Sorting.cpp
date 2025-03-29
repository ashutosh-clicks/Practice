#include <iostream>
using namespace std;

int main(){
    int n = 6;
    int arr[6] = {5,5,4,1,2,3};

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

    int k = 0;
    while(k<n){
        cout<<arr[k]<<" ";
        k++;
    }



    return 0;
}