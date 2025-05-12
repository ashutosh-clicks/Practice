#include <iostream>
using namespace std;

class Complex{
    private:
    float real;
    float imag;

    public:
    Complex(float real = 0, float imag = 0){
        this->real = real;
        this->imag = imag;
    }

    Complex operator +(const Complex& other){
        Complex result;
        result.real = real + other.real;
        result.imag = imag + other.imag;
        return result;
    }
    void display() {
        cout << real << " + " << imag << "i" << endl;
    }
};

int main(){
    Complex c1(1,1);
    Complex c2(1.2,0.1);
    Complex c3 = c1+c2;
    c3.display();
}