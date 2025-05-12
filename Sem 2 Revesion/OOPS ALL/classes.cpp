#include <iostream>
using namespace std;

class Car{
    private:
    string brand,model;
    int year;

    public:
    Car(){
        brand = "NA";
        model = "NA";
        year = 0;
        cout<<"Created Car"<<endl;
    }
    Car(string brand,string model,int year){
        this->brand = brand;
        this->model = model;
        this->year = year;
        cout<<"Created Car"<<endl;
    }
    ~Car(){
        cout<<"Destroyed Car"<<endl;
    }

    void print(){
        cout<<brand<<endl<<model<<endl<<year<<endl;
    }

};


int main(){
    // Car *c1 = new Car("Tesla","Y",2013);
    Car c1("Tesla","Y",2013);
    c1.print();

}