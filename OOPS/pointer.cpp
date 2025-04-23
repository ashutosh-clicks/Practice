#include <cstring>
#include <iostream>
using namespace std;


// int main()
// {
//     int i = 3;
//     cout<< i;
//     cout<< * (&i);
//     cout<< &i;
// }

// int main()
// {
//     int x=3, *j;
// j=&x;
// cout<< x;
// cout<< * (&x);
// cout<< *  &j;
// }
//  int main()
//  { int arr[5] = {11,22,33,44,55};
//  for (int i=0; i<5; i++)
 
//  cout<< * (arr+i);
//  return 0;
//  }
// int main()
// {const char* ptr[7]={"sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"};
// for (int i=0; i<7; i++)
// cout<< ptr[i]<<endl;
// return 0;
// }

// int main(){
//     char* str ="Idle hands are the devil' workshop";
//     int len = strlen (str);
//     char * ptr;
//     ptr = new char [len+1];
//     strcpy(ptr,str);
//     cout<<ptr;
//     delete[]ptr;
//     return 0;
//}

class Base{
    public:
    virtual void show(){
        cout<<"\nBase";
    }
};
class Dev1: public Base{
    public:
    void show(){
        cout<<"\nDEv1";
    }

};

class Dev2: public Base{
    public:
    void show(){
        cout<<"\nDev2";
    }

};

int main(){
    Dev1 d1;
    Dev2 d2;
    Base *ptr;
    ptr = &d1;
    ptr->show();
    ptr = &d2;
    ptr->show();
    //what is polymorphism
    
}