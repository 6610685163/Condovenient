import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart'; // 1. ต้อง import ตัวนี้
import 'login_screen.dart';

void main() async {
  // 2. ต้องเปลี่ยนเป็น async
  // 3. ต้องเพิ่มบรรทัดนี้เพื่อให้แน่ใจว่า Flutter พร้อมทำงานก่อนเรียก Firebase
  WidgetsFlutterBinding.ensureInitialized();

  // 4. เริ่มต้นทำงาน Firebase
  await Firebase.initializeApp();

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Condovenient',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(primarySwatch: Colors.blueGrey, useMaterial3: true),
      home: const LoginScreen(),
    );
  }
}
