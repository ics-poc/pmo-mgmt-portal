package com.pmo.demo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "br_skill_map", schema = "pmo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BrSkillMapEntity {

	@Id
	@Column(name = "auto_req_id", length = 50, nullable = false)
	private String autoReqId;

	@Column(name = "skill_name", length = 100)
	private String skillName;

    @Column(name = "preferred_flag", length = 1)
    private String preferredFlag;
}
