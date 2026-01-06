package com.pmo.demo.config;

//@Configuration
public class SecurityConfig {
 
//    @Bean
//    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
//        http
//            .csrf(csrf -> csrf.disable())
//            .cors(withDefaults()) // **1. Enables CORS**
//            .authorizeHttpRequests(auth -> auth
//                .anyRequest().permitAll()
//            )
//            .httpBasic(httpBasic -> {});
// 
//        return http.build();
//    }
 
    // **2. Defines your CORS rules**
//    @Bean
//    public CorsConfigurationSource corsConfigurationSource() {
//        CorsConfiguration configuration = new CorsConfiguration();
//        // This is the line to change:
//        // Allow your React app's origin
//        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000")); 
//        // Specify which methods are allowed
//        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
//        // Specify which headers are allowed
//        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
//        // Allow credentials (like cookies)
//        configuration.setAllowCredentials(true);
//        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//        // Apply this configuration to all paths in your application
//        source.registerCorsConfiguration("/**", configuration);
//        return source;
//    }
}

