package com.pmo.demo.serviceImpl;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.pmo.demo.service.EmailService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService{

	private final JavaMailSender mailSender;

    @Override
    public void sendMagicLink(String toEmail, String link) {

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Temporary Access Link");
        message.setText(
            "You have been granted temporary access.\n\n" +
            "Click the link below to continue:\n" +
            link + "\n\n" +
            "This link will expire in 30 minutes."
        );

        mailSender.send(message);
    }
}
