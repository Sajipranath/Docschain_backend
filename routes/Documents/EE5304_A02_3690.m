close all;   
clear;
clc;

%%
% ---Ybus matrix of sample system---
Z12 = 0.038i;
Z13 = 0.031i;
Z23 = 0.028i;

y12 = 1/Z12;
y13 = 1/Z13;
y23 = 1/Z23;
y21 = y12;
y31 = y13;
y32 = y23;

% Diagonal elements 
Y_11 = y12+y13;
Y_22 = y21+y23;
Y_33 = y13+y23;

Y_12 = -y12;
Y_13 = -y13;
Y_23 = -y23;
Y_21 = Y_12;
Y_31 = Y_13;
Y_32 = Y_23;

%Admittance matrix
Ybus = [Y_11 Y_12 Y_13;Y_21 Y_22 Y_23;Y_31 Y_32 Y_33]; 
Ybus_mag = abs(Ybus); %magnitude
Ybus_alpha = angle(Ybus); % angle in radians

%(Base MVA=100)
% Convert loads to per unit values
P_L2 = 0;
P_L3 = 400/100;
Q_L3 = 150/100;
% Convert generation to per unit values.
P_g2 = 300/100;
P_g3 = 0;
Q_g3 = 0;
% net injections
P2 = P_g2-P_L2;
P3 = P_g3-P_L3;
Q3 = Q_g3-Q_L3;

S3 = P3+Q3*1i;% Apperent power S3

% Slack Bus voltage
V1 = 1.04+0i;

V2(1) = 1.01+0i; %fixed value

%unknown bus voltage Initilizing
V3(1) = 1.0+0i;

% Tolerence 
tol = 0.0001;

% Iteration counter 
itr = 1; 
error_max = 1;

while error_max > tol 
    
    Q2 = abs(V2(itr))*(abs(V1)*abs(Y_21)*sin(angle(V2(itr))-angle(V1)-angle(Y_21))+abs(V2(itr))*abs(Y_22)*sin(angle(V2(itr))-angle(V2(itr))-angle(Y_22))+abs(V3(itr))*abs(Y_23)*sin(angle(V2(itr))-angle(V3(itr))-angle(Y_23)));
    S2 = P2+Q2*1i;% Apperent power S2
    V2(itr+1) = (1/Y_22)*((conj(S2)/conj(V2(itr)))-Y_21*V1-Y_23*V3(itr));
    V3(itr+1) = (1/Y_33)*((conj(S3)/conj(V3(itr)))-Y_31*V1-Y_32*V2(itr+1));
        
    error_V2 = V2(itr+1)-V2(itr);
    error_V3 = V3(itr+1)-V3(itr);
    error_max = max(abs([error_V2 error_V3]));
     
        
    itr = itr+1;    
end


%%  active and reactive power at the slack bus

V_all = [V1 V2(end) V3(end)];
V_mag = abs(V_all);
V_ang = angle(V_all);  % angle in radians

P1_calc = V_mag(1)*(V_mag(1)*Ybus_mag(1,1)*cos(V_ang(1)-V_ang(1)-Ybus_alpha(1,1))+...
                    V_mag(2)*Ybus_mag(1,2)*cos(V_ang(1)-V_ang(2)-Ybus_alpha(1,2))+...
                    V_mag(3)*Ybus_mag(1,3)*cos(V_ang(1)-V_ang(3)-Ybus_alpha(1,3)));
Q1_calc = V_mag(1)*(V_mag(1)*Ybus_mag(1,1)*sin(V_ang(1)-V_ang(1)-Ybus_alpha(1,1))+...
                    V_mag(2)*Ybus_mag(1,2)*sin(V_ang(1)-V_ang(2)-Ybus_alpha(1,2))+...
                    V_mag(3)*Ybus_mag(1,3)*sin(V_ang(1)-V_ang(3)-Ybus_alpha(1,3)));                




%% Display results
disp('Gauss Seidel Load flow')
results = [(1:1:itr)'  abs(V3)'  (180/pi)*angle(V3)' (180/pi)*angle(V2)'];
disp('------------------------------------------------------------')
disp('Iteration | V3(pu)| Theta_3(deg) | Theta_2 (deg) |')
disp('------------------------------------------------------------')
disp(num2str(results))
disp('------------------------------------------------------------')

disp(['V2 = ' num2str(V_mag(2)) ' pu, ' num2str(V_ang(2)) ' rad'])
disp(['V3 = ' num2str(V_mag(3)) ' pu, ' num2str(V_ang(3)) ' rad'])
disp(['Slack bus real power : ' num2str(P1_calc) ' pu']);
disp(['Slack bus reactive power : ' num2str(Q1_calc) ' pu'])

%%


