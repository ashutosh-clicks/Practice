import java.util.Scanner;

public class p1 {
    public static void main(String[] args) {
        
        

        // Pract2 p2 = new Pract2();
        // p2.execute();

        // Pract3 p3 = new Pract3();
        // p3.execute();

        // Pract9 p9 = new Pract9();
        // p9.execute();

        Student s1 = new Student("Ashutosh",59089, 10);
        Student s2 = new Student("Kaala Baasha",67658,11);
        Student s3 = new Student("Ujji",56527,9);

        if(s1.marks>s2.marks && s1.marks>s3.marks){System.out.println(s1.marks);}
        else if(s2.marks > s1.marks && s2.marks > s3.marks){System.out.println(s2.marks);}
        else{System.out.println(s3.marks);}


    }
}

class Pract1{
    static void execute(){
        byte age = 19;
        short admissionYear = 2024;
        int rollNumber = 59089;
        long phoneNumber = 9876543210L;
        float cgpa = 8.75f;
        double attendance = 82;
        char section = '1';
        boolean hostelResident = false;

        System.out.println("|          STUDENT CARD          |");
        System.out.println("Age             : " + age);
        System.out.println("Admission Year  : " + admissionYear);
        System.out.println("Roll Number     : " + rollNumber);
        System.out.println("Phone Number    : " + phoneNumber);
        System.out.println("CGPA            : " + cgpa);
        System.out.println("Attendance      : " + attendance + "%");
        System.out.println("Section         : " + section);
        System.out.println("Hostel          : " + hostelResident);
    }
}

class Pract2{
    static void execute(){
        

        String[] name = {"Ashutosh", "Eklavya", "Ujji", "Aman", "Navpreet"};
        System.out.println("Practical 2");    
        System.out.println(name[0]);   
        System.out.println(name[1]);    
        System.out.println(name[2]);    
        System.out.println(name[3]);    
        System.out.println(name[4]);    

    }
}

class Pract3{
    static void execute(){
        int num1 = 25;
        double convertedDouble = num1;
        double num2 = 45.62;
        int convertedInt = (int) num2;

        System.out.println("Practical 3");
        System.out.println(num1);
        System.out.println(convertedDouble);
        System.out.println(num2);
        System.out.println(convertedInt);
        


    }
}

class Pract9{
    static void execute(){
        Scanner s1 = new Scanner(System.in);
        String pass = "12345";
        System.out.print("Enter Password");
        String ent = "";
        ent = s1.next();


        while(true){
            if(ent.equals(pass)){
                System.out.println("Correct Password AAAAUUUUUU");
                break;
            }
            else{
                System.out.print("Try again:");
                ent = s1.next();
            }
        }

        s1.close();
    }
}


class Student{
    String name;
    int roll_no;
    float marks;
    Student(String n, int r, float m){
        this.name = n;
        this.roll_no = r;
        this.marks = m;
    }
    void display(){
        System.out.println(name);
        System.out.println(roll_no);
        System.out.println(marks);


    }
}


