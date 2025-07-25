package com.hrms.backend.config;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import com.hrms.backend.service.UserDetailsServiceImpl;

//import com.hrms.backend.security.JwtAuthEntryPoint;
//import com.hrms.backend.security.JwtAuthFilter;


@Configuration
@EnableWebSecurity // Enable Spring Security
@EnableMethodSecurity(prePostEnabled = true) // Enable method-level security (e.g., @PreAuthorize)
public class SecurityConfig {
	
	//private final JwtAuthEntryPoint authEntryPoint;
    //private final JwtAuthFilter jwtAuthFilter;
    //private final UserRepository userRepository; // Inject UserRepository
	
	/*public SecurityConfig(JwtAuthEntryPoint authEntryPoint, JwtAuthFilter jwtAuthFilter, UserRepository userRepository) {
        this.authEntryPoint = authEntryPoint;
        this.jwtAuthFilter = jwtAuthFilter;
        this.userRepository = userRepository;
    }*/
	
	/*@Bean
    public UserDetailsService userDetailsService() {
        return username -> userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
    }*/
	
	@Autowired
    private UserDetailsServiceImpl userDetailsService; // Inject your UserDetailsServiceImpl

    @Autowired
    private AuthEntryPointJwt unauthorizedHandler; // Inject your AuthEntryPointJwt

    /*
    // Define the JWT authentication filter
    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        return new AuthTokenFilter();
    }*/
    
    @Autowired
    private AuthTokenFilter authTokenFilter;
    
    @Autowired // Inject your custom provider
    private CustomAuthenticationProvider customAuthenticationProvider;

    @Bean
    public DaoAuthenticationProvider daoAuthenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder()); // THIS IS CRUCIAL AND IS CORRECTLY SET
        return authProvider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    /*
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }*/
    
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        // Use ProviderManager to combine multiple authentication providers
        // CustomAuthenticationProvider will try first for hardcoded admin, then DaoAuthenticationProvider for DB users.
        return new ProviderManager(Arrays.asList(customAuthenticationProvider, daoAuthenticationProvider()));
    }
	
	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http
			.cors(cors -> cors.configurationSource(corsConfigurationSource())) // <--- NEW: Configure CORS here
			.csrf(csrf -> csrf.disable()) // Disable CSRF for REST APIs (handled by JWTs) [cite: 249]
			.exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler)) // (authEntryPoint)
			.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Use stateless sessions for JWT [cite: 234]
			.authorizeHttpRequests(authorize -> authorize
					.requestMatchers("/api/frontend-logs/**").permitAll() // Allow unauthenticated access to auth endpoints [cite: 234]
					.requestMatchers("/api/auth/contact-us").permitAll() // <--- ADD OR MODIFY THIS LINE
					.requestMatchers("/api/auth/**").permitAll() // Allow public registration/login
	                .requestMatchers("/api/admin/**").hasRole("ADMIN") // ADMIN specific endpoints
	                .requestMatchers("/api/employee/**").hasAnyRole("ADMIN", "EMPLOYEE") // HR specific endpoints
					.anyRequest().authenticated() // All other requests require authentication [cite: 234]
					//.requestMatchers("/api/auth/**").permitAll() // Allow unauthenticated access to auth endpoints [cite: 234]
	         );
		// Add JWT filter later here
		//http.authenticationProvider(daoAuthenticationProvider()); // Set your custom authentication provider
		http.authenticationProvider(daoAuthenticationProvider());
		
        // Add the JWT token filter before the Spring Security's default UsernamePasswordAuthenticationFilter
        //http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);
        //http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        
        // Add the JWT token filter before the Spring Security's default UsernamePasswordAuthenticationFilter
        http.addFilterBefore(authTokenFilter, UsernamePasswordAuthenticationFilter.class);
		
		return http.build();
	}
	
	@Bean
	public CorsFilter corsFilter() {
		UrlBasedCorsConfigurationSource source= new UrlBasedCorsConfigurationSource();
		CorsConfiguration config = new CorsConfiguration();
		config.setAllowCredentials(true);
		// Allow your React frontend URL. In development, you might use "*" or "http://localhost:5173"
		config.addAllowedOriginPattern("*"); // Allows all origins during development. Refine for production.
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        source.registerCorsConfiguration("/**", config);
        
        return new CorsFilter(source);
	}
	
	// <--- NEW: Define a CorsConfigurationSource bean instead of CorsFilter
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        // Explicitly allow your frontend origin. Avoid "*" in production.
        config.setAllowedOrigins(Arrays.asList("http://localhost:5173")); // Your React frontend URL
        config.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "Accept")); // Explicitly list headers
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS")); // Allowed HTTP methods
        config.setMaxAge(3600L); // Cache pre-flight response for 1 hour

        source.registerCorsConfiguration("/**", config); // Apply this configuration to all paths
        return source;
    }
    // <--- END NEW CorsConfigurationSource

}
