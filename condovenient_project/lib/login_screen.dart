import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:flutter_facebook_auth/flutter_facebook_auth.dart';
import 'home_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  final String backendUrl = 'http://10.0.2.2:3000';

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _roomController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;

  @override
  void dispose() {
    _roomController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  // --- ฟังก์ชันช่วยจัดการผลลัพธ์จาก Backend ---
  void _processLoginResponse(http.Response response, String provider) {
    final data = jsonDecode(response.body);
    if (response.statusCode == 200 && data['success']) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('$provider Login สำเร็จ: ${data['user']['name']}'),
          ),
        );
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (context) => HomeScreen(
              userName: data['user']['name'] ?? 'User',
              userRole: data['user']['role'] ?? 'Resident',
              userId: data['user']['id'] ?? '',
              roomNumber: data['user']['roomNumber'] ?? '',
            ),
          ),
        );
      }
    } else {
      _showError(data['message'] ?? 'เข้าสู่ระบบไม่สำเร็จ');
    }
  }

  void _showError(String message) {
    if (mounted) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(message)));
    }
  }

  // 1. ฟังก์ชัน Login เชื่อมต่อ Backend จริง
  void _handleLogin() async {
    if (_roomController.text.isEmpty || _passwordController.text.isEmpty) {
      _showError('กรุณากรอกเลขห้องและรหัสผ่าน');
      return;
    }

    setState(() => _isLoading = true);

    try {
      // เรียก Backend API /api/auth/login
      final response = await http.post(
        Uri.parse('${widget.backendUrl}/api/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'username': _roomController.text.trim(),
          'password': _passwordController.text,
        }),
      );
      _processLoginResponse(response, 'Password');
    } catch (e) {
      _showError('ไม่สามารถเชื่อมต่อ Server ได้: $e');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  // 2. ฟังก์ชัน Login ด้วย Google
  void _handleGoogleLogin() async {
    setState(() => _isLoading = true);
    try {
      final GoogleSignInAccount? googleUser = await GoogleSignIn().signIn();
      if (googleUser == null) {
        setState(() => _isLoading = false);
        return;
      }
      final GoogleSignInAuthentication googleAuth =
          await googleUser.authentication;
      final AuthCredential credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );
      final UserCredential userCredential = await FirebaseAuth.instance
          .signInWithCredential(credential);
      final String? idToken = await userCredential.user?.getIdToken();

      if (idToken != null) {
        final response = await http.post(
          Uri.parse('${widget.backendUrl}/api/auth/google-login'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({'token': idToken}),
        );
        _processLoginResponse(response, 'Google');
      }
    } catch (e) {
      _showError('Google Login Error: $e');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  // 3. ฟังก์ชัน Login ด้วย Facebook (แก้ไขส่วนการแลก Token)
  void _handleFacebookLogin() async {
    setState(() => _isLoading = true);
    try {
      final LoginResult result = await FacebookAuth.instance.login(
        permissions: ['public_profile', 'email'],
      );

      if (result.status == LoginStatus.success) {
        // --- ส่วนที่แก้ไข: แลก Facebook Access Token เป็น Firebase ID Token ---
        final AuthCredential credential = FacebookAuthProvider.credential(
          result.accessToken!.tokenString,
        );

        // Sign In เข้า Firebase
        final UserCredential userCredential = await FirebaseAuth.instance
            .signInWithCredential(credential);

        // ดึง Firebase ID Token (ตัวที่ Backend ตรวจสอบได้)
        final String? idToken = await userCredential.user?.getIdToken();

        if (idToken != null) {
          final response = await http.post(
            Uri.parse('${widget.backendUrl}/api/auth/facebook-login'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({'token': idToken}), // ส่ง Firebase ID Token ไปแทน
          );
          _processLoginResponse(response, 'Facebook');
        }
      } else {
        _showError('ยกเลิก Facebook Login: ${result.message}');
      }
    } catch (e) {
      _showError('Facebook Error: $e');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.apartment_rounded,
                size: 100,
                color: Colors.lightBlue,
              ),
              const SizedBox(height: 20),
              const Text(
                'Condovenient',
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  color: Colors.blue,
                ),
              ),
              const Text(
                'ระบบจัดการคอนโดมิเนียม',
                style: TextStyle(fontSize: 16, color: Colors.grey),
              ),
              const SizedBox(height: 40),
              Card(
                elevation: 4,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    children: [
                      TextFormField(
                        controller: _roomController,
                        decoration: const InputDecoration(
                          labelText: 'เลขห้อง / เบอร์โทร',
                          prefixIcon: Icon(Icons.meeting_room),
                          border: OutlineInputBorder(),
                        ),
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _passwordController,
                        obscureText: true,
                        decoration: const InputDecoration(
                          labelText: 'รหัสผ่าน',
                          prefixIcon: Icon(Icons.lock),
                          border: OutlineInputBorder(),
                        ),
                      ),
                      const SizedBox(height: 24),
                      SizedBox(
                        width: double.infinity,
                        height: 50,
                        child: ElevatedButton(
                          onPressed: _isLoading ? null : _handleLogin,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.lightBlue,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                          child: _isLoading
                              ? const CircularProgressIndicator(
                                  color: Colors.white,
                                )
                              : const Text(
                                  'เข้าสู่ระบบ',
                                  style: TextStyle(fontSize: 18),
                                ),
                        ),
                      ),
                      const SizedBox(height: 20),
                      Row(
                        children: [
                          Expanded(child: Divider(color: Colors.grey[300])),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 10),
                            child: Text(
                              'หรือ',
                              style: TextStyle(color: Colors.grey[500]),
                            ),
                          ),
                          Expanded(child: Divider(color: Colors.grey[300])),
                        ],
                      ),
                      const SizedBox(height: 20),
                      // Google Button
                      SizedBox(
                        width: double.infinity,
                        height: 50,
                        child: OutlinedButton(
                          onPressed: _isLoading ? null : _handleGoogleLogin,
                          style: OutlinedButton.styleFrom(
                            backgroundColor: Colors.white,
                            side: BorderSide(color: Colors.grey.shade300),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              // --- แก้ไขตรงนี้: เปลี่ยน URL และดัก Error ---
                              Image.network(
                                'https://cdn-icons-png.flaticon.com/512/2991/2991148.png',
                                height: 24,
                                width: 24,
                                errorBuilder: (context, error, stackTrace) {
                                  // ถ้าโหลดรูปไม่ขึ้น จะโชว์ไอคอนตัว G แทน แอปจะได้ไม่พัง (ไม่เกิดจอดำเหลือง)
                                  return const Icon(
                                    Icons.g_mobiledata,
                                    size: 32,
                                    color: Colors.blue,
                                  );
                                },
                              ),
                              // ----------------------------------------
                              const SizedBox(width: 12),
                              const Text(
                                'เข้าสู่ระบบด้วย Google',
                                style: TextStyle(
                                  fontSize: 16,
                                  color: Colors.black87,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      // Facebook Button
                      SizedBox(
                        width: double.infinity,
                        height: 50,
                        child: ElevatedButton.icon(
                          onPressed: _isLoading ? null : _handleFacebookLogin,
                          icon: const Icon(Icons.facebook, color: Colors.white),
                          label: const Text(
                            'เข้าสู่ระบบด้วย Facebook',
                            style: TextStyle(
                              fontSize: 16,
                              color: Colors.white,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF1877F2),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),
              TextButton(
                onPressed: () {},
                child: const Text('ลืมรหัสผ่าน? / ติดต่อนิติบุคคล'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
