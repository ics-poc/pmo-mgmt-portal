package com.pmo.demo.entity;

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
@Table(name = "header_field_mapping", schema = "pmo")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class HeaderFieldMappingEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "entity_name")
    private String entityName;

    @Column(name = "header_name")
    private String headerName;

    @Column(name = "entity_field_name")
    private String entityFieldName;

    @Column(name = "active")
    private Boolean active;
}

