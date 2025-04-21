#include <iostream>

using namespace std;

class AddElements{

    private:
    int n;
    string type;
    int n1,n2;
    float f1,f2;
    string s1,s2;
    public:
        string concatenate(){
            cout<<"Strings:";
            cin>>s1>>s2;
            return s1+s2;
        }


        void add(){
            cout<<"N: ";
            cin>>n;
            for(int i = 1;i<=n;i++){
                cout<<"Type: ";
                cin>>type;
                if(type == "int"){
                    cout<<"Enter ints: ";
                    cin>>n1>>n2;
                    cout<<n1+n2<<endl;
                }
                else if(type == "float"){
                    cout<<"Floats: ";
                    cin>>f1>>f2;
                    cout<<f1+f2<<endl;
                }
                else if(type == "string"){

                    cout<<concatenate()<<endl;
                }

            }
        }


};

int main(){
    AddElements add1;
    AddElements add2;
    // add1.add();
    add2.add();

}