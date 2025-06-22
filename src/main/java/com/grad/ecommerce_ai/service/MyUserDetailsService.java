import com.grad.ecommerce_ai.entity.User;
import com.grad.ecommerce_ai.entity.details.UserPrincipal;
import com.grad.ecommerce_ai.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class MyUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public MyUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new UsernameNotFoundException("User not found with email: " + email);
        }
       // System.out.println(userPrincipal.getUsername() + " " + userPrincipal.getPassword());

        return new UserPrincipal(user);
    }
} 