import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class VisitorScreen extends StatefulWidget {
  final String userId;
  final String roomNumber;
  const VisitorScreen({super.key, this.userId = '', this.roomNumber = ''});

  @override
  State<VisitorScreen> createState() => _VisitorScreenState();
}

class _VisitorScreenState extends State<VisitorScreen> {
  final _formKey = GlobalKey<FormState>();
  final String _backendUrl = 'http://10.0.2.2:3000';

  final _nameController = TextEditingController();
  final _plateController = TextEditingController();
  final _purposeController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _nameController.dispose();
    _plateController.dispose();
    _purposeController.dispose();
    super.dispose();
  }

  void _submitVisitorCheckIn() async {
    if (_formKey.currentState!.validate()) {
      setState(() => _isSubmitting = true);
      try {
        final response = await http.post(
          Uri.parse('$_backendUrl/api/visitors/check-in'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
            'visitorName': _nameController.text.trim(),
            'plateNumber': _plateController.text.trim().toUpperCase(),
            'contactRoom': widget.roomNumber,
            'purpose': _purposeController.text.trim(),
            'addedBy': 'ลูกบ้านห้อง ${widget.roomNumber}',
          }),
        );
        final data = jsonDecode(response.body);

        if (mounted) {
          setState(() => _isSubmitting = false);
          if (response.statusCode == 201) {
            showDialog(
              context: context,
              builder: (context) => AlertDialog(
                backgroundColor: const Color(0xFF1E1E1E),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20),
                  side: const BorderSide(color: Color(0xFF2A2A2A)),
                ),
                content: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(
                      Icons.check_circle,
                      color: Colors.amber,
                      size: 64,
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'ลงทะเบียนเข้าสำเร็จ',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'ผู้มาติดต่อ ${_nameController.text} ได้รับการบันทึกเข้าแล้ว',
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: Colors.grey),
                    ),
                    const SizedBox(height: 24),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () {
                          Navigator.pop(context);
                          _nameController.clear();
                          _plateController.clear();
                          _purposeController.clear();
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.amber,
                          foregroundColor: Colors.black,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                        child: const Text(
                          'ตกลง',
                          style: TextStyle(fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          } else {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(data['error'] ?? 'เกิดข้อผิดพลาด')),
            );
          }
        }
      } catch (e) {
        if (mounted) {
          setState(() => _isSubmitting = false);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('ไม่สามารถเชื่อมต่อ Server ได้: $e')),
          );
        }
      }
    }
  }

  InputDecoration _buildInputDecoration(String hint, IconData icon) {
    return InputDecoration(
      hintText: hint,
      hintStyle: const TextStyle(color: Colors.grey),
      prefixIcon: Icon(icon, color: Colors.amber),
      filled: true,
      fillColor: const Color(0xFF1E1E1E),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFF2A2A2A)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Colors.amber, width: 1.5),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      appBar: AppBar(
        title: const Text(
          'ลงทะเบียนผู้มาติดต่อ',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
        elevation: 0,
        backgroundColor: const Color(0xFF1E1E1E),
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.amber.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.amber.withOpacity(0.3)),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.info_outline, color: Colors.amber),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text(
                          'ลงทะเบียนผู้มาติดต่อ',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Colors.amber,
                          ),
                        ),
                        SizedBox(height: 4),
                        Text(
                          'กรุณากรอกข้อมูลผู้มาติดต่อเพื่อการรักษาความปลอดภัยของคอนโดมิเนียม',
                          style: TextStyle(fontSize: 12, color: Colors.grey),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 28),
            Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'ชื่อผู้มาติดต่อ *',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: _nameController,
                    style: const TextStyle(color: Colors.white),
                    decoration: _buildInputDecoration(
                      'เช่น สมชาย ดีเยี่ยม',
                      Icons.person_outline,
                    ),
                    validator: (value) => value == null || value.isEmpty
                        ? 'กรุณากรอกชื่อผู้มาติดต่อ'
                        : null,
                  ),
                  const SizedBox(height: 20),
                  const Text(
                    'ทะเบียนรถ *',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: _plateController,
                    style: const TextStyle(color: Colors.white),
                    textCapitalization: TextCapitalization.characters,
                    decoration: _buildInputDecoration(
                      'เช่น กท 1234 (หากไม่มี ให้ระบุ "ไม่มี")',
                      Icons.directions_car_outlined,
                    ),
                    validator: (value) => value == null || value.isEmpty
                        ? 'กรุณากรอกทะเบียนรถ'
                        : null,
                  ),
                  const SizedBox(height: 20),
                  const Text(
                    'วัตถุประสงค์',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: _purposeController,
                    style: const TextStyle(color: Colors.white),
                    decoration: _buildInputDecoration(
                      'เช่น ส่งของ, ซ่อมแซม, เพื่อน',
                      Icons.edit_document,
                    ),
                  ),
                  const SizedBox(height: 32),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _isSubmitting ? null : _submitVisitorCheckIn,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.amber,
                        disabledBackgroundColor: Colors.grey[800],
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                      child: _isSubmitting
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation<Color>(
                                  Colors.black,
                                ),
                              ),
                            )
                          : const Text(
                              'ลงทะเบียนเข้า',
                              style: TextStyle(
                                color: Colors.black,
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
