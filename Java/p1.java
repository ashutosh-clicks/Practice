public class p1 {
    public static void main(String[] args) {
        String name = "Ashutosh Panduey";
        byte age = 19;
        short admissionYear = 2024;
        int rollNumber = 59089;
        long phoneNumber = 9876543210L;
        float cgpa = 8.75f;
        double attendance = 82;
        char section = '1';
        boolean hostelResident = false;

        System.out.println("|          STUDENT CARD          |");
        System.out.println("Name            : " + name);
        System.out.println("Age             : " + age);
        System.out.println("Admission Year  : " + admissionYear);
        System.out.println("Roll Number     : " + rollNumber);
        System.out.println("Phone Number    : " + phoneNumber);
        System.out.println("CGPA            : " + cgpa);
        System.out.println("Attendance      : " + attendance + "%");
        System.out.println("Section         : " + section);
        System.out.println("Hostel          : " + hostelResident);

        Pract2 p2 = new Pract2();
        p2.execute();

        Pract3 p3 = new Pract3();
        p3.execute();

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
