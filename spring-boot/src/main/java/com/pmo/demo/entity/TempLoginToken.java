package com.pmo.demo.entity;


import java.sql.Timestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "temp_login_tokens", schema = "pmo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TempLoginToken {

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
	
	@Column(name = "id")
    private Long id;

	@Column(name = "email")
    private String email;

	@Column(name = "token")
    private String token;

	@Column(name = "expires_at")
    private Timestamp expiresAt;

	@Column(name = "created_at")
    private Timestamp createdAt;
    
    @Column(name = "redirect_path")
    private String redirectPath;

}
